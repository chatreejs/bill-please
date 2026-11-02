import axios from 'axios';

import { IReceiptItem, IReceiptScanProgress } from '@interfaces';
import { normalizeReceiptItems } from './bill.util';

const MAX_IMAGE_DIMENSION = 1600;

/**
 * Downscale phone photos to a JPEG of at most MAX_IMAGE_DIMENSION px so the
 * upload is fast and fits the API size limit. Falls back to the original
 * file when the browser cannot decode it (e.g. HEIC outside Safari).
 */
const resizeImage = async (image: File): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(image);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ?? image;
  } catch {
    return image;
  }
};

const getApiUrl = (): string => {
  const apiUrl = process.env.VITE_APP_BILL_PLEASE_MCP_URL;
  if (!apiUrl) {
    throw new Error('VITE_APP_BILL_PLEASE_MCP_URL is not set');
  }
  return apiUrl.replace(/\/$/, '');
};

/**
 * The URL of the scanner status stream on bill-please-mcp, or undefined when
 * the API URL is not set. EventSource sends `Accept: text/event-stream`, so
 * the server answers with a `status` event now and another each time its LLM
 * queue changes. `busy` is true while that queue is full.
 */
export const getReceiptScannerStatusUrl = (): string | undefined => {
  const apiUrl = process.env.VITE_APP_BILL_PLEASE_MCP_URL;
  return apiUrl
    ? `${apiUrl.replace(/\/$/, '')}/api/receipts/status`
    : undefined;
};

export type ReceiptScanFailureReason =
  | 'busy'
  | 'unreadable'
  | 'rate_limited'
  | 'turnstile_rejected'
  | 'turnstile_unavailable'
  | 'too_large'
  | 'unsupported_type'
  | 'timeout'
  | 'network'
  | 'server_error'
  | 'unknown';

/**
 * A failure that arrives as an `error` event in the scan stream, after the
 * server has already answered 200. It has the status and code that the
 * JSON answer would have.
 */
export class ReceiptScanError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    message = 'Receipt scan failed',
  ) {
    super(message);
    this.name = 'ReceiptScanError';
  }
}

/** The response body as an object, because a scan asks for text */
const parseBody = (data: unknown): { code?: unknown } | undefined => {
  if (typeof data !== 'string') return data as { code?: unknown } | undefined;
  try {
    return JSON.parse(data) as { code?: unknown };
  } catch {
    return undefined;
  }
};

/**
 * Why a scan failed, from the bill-please-mcp response, for the busy message
 * and analytics. The busy 503 has `code: 'scanner_busy'`, which tells it
 * apart from the 503 for an unreachable Turnstile siteverify.
 */
export const getReceiptScanFailureReason = (
  error: unknown,
): ReceiptScanFailureReason => {
  if (error instanceof ReceiptScanError) {
    return reasonFromStatus(error.status, error.code);
  }
  if (!axios.isAxiosError(error)) return 'unknown';
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? 'timeout'
      : 'network';
  }
  return reasonFromStatus(
    error.response.status,
    parseBody(error.response.data)?.code,
  );
};

const reasonFromStatus = (
  status: number,
  code: unknown,
): ReceiptScanFailureReason => {
  switch (status) {
    case 503:
      return code === 'scanner_busy' ? 'busy' : 'turnstile_unavailable';
    case 422:
      return 'unreadable';
    case 429:
      return 'rate_limited';
    case 403:
      return 'turnstile_rejected';
    case 413:
      return 'too_large';
    case 415:
      return 'unsupported_type';
    default:
      return status >= 500 ? 'server_error' : 'unknown';
  }
};

export interface ServerSentEvent {
  event: string;
  data: unknown;
}

/**
 * Parse the complete events in a Server-Sent Events body. A trailing event
 * without its blank line is still arriving, so it is left out.
 */
export const parseServerSentEvents = (text: string): ServerSentEvent[] => {
  const blocks = text.replace(/\r\n/g, '\n').split('\n\n');
  blocks.pop();
  return blocks.flatMap((block) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trim());
    }
    if (data.length === 0) return [];
    try {
      return [{ event, data: JSON.parse(data.join('\n')) as unknown }];
    } catch {
      return [];
    }
  });
};

/** The items from a finished scan stream, or the ReceiptScanError it sent */
const readScanStream = (text: string): unknown => {
  const events = parseServerSentEvents(text);
  const error = events.find((e) => e.event === 'error');
  if (error) {
    const data = error.data as {
      status?: number;
      code?: string;
      error?: string;
    };
    throw new ReceiptScanError(data.status ?? 502, data.code, data.error);
  }
  const result = events.find((e) => e.event === 'result');
  if (!result)
    throw new ReceiptScanError(
      502,
      undefined,
      'The scan stream ended without a result',
    );
  return result.data;
};

/**
 * Send a receipt image to bill-please-mcp and get bill items back.
 * `turnstileToken` is sent as the `cf-turnstile-response` form field, which
 * the backend checks with Cloudflare's siteverify before running OCR.
 *
 * It asks for Server-Sent Events, so `onProgress` gets the upload, then each
 * step on the server. An older server answers with one JSON body, and then
 * onProgress gets only the upload.
 */
export const scanReceipt = async (
  image: File,
  turnstileToken?: string,
  onProgress?: (progress: IReceiptScanProgress) => void,
): Promise<IReceiptItem[]> => {
  const apiUrl = getApiUrl();

  const resized = await resizeImage(image);
  const formData = new FormData();
  formData.append(
    'image',
    resized,
    resized === image ? image.name : 'receipt.jpg',
  );
  if (turnstileToken) {
    formData.append('cf-turnstile-response', turnstileToken);
  }
  let seenEvents = 0;
  const response = await axios.post<string>(
    `${apiUrl}/api/receipts/scan`,
    formData,
    {
      timeout: 60_000,
      // XHR exposes the response text while it arrives. The axios fetch adapter doesn't
      adapter: 'xhr',
      responseType: 'text',
      headers: { Accept: 'text/event-stream' },
      onUploadProgress: (event) => {
        onProgress?.({
          stage: 'upload',
          uploadPercent: Math.round((event.progress ?? 0) * 100),
        });
      },
      onDownloadProgress: (event) => {
        const text = (event.event as ProgressEvent<XMLHttpRequest> | undefined)
          ?.target?.responseText;
        if (!onProgress || !text) return;
        const events = parseServerSentEvents(text);
        for (const { event: name, data } of events.slice(seenEvents)) {
          if (name === 'progress') onProgress(data as IReceiptScanProgress);
        }
        seenEvents = events.length;
      },
    },
  );
  const isStream = String(response.headers['content-type'] ?? '').includes(
    'text/event-stream',
  );
  return normalizeReceiptItems(
    isStream ? readScanStream(response.data) : parseBody(response.data),
  );
};
