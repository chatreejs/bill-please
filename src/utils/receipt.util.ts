import axios from 'axios';

import { IReceiptItem, IReceiptScannerStatus } from '@interfaces';
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
 * Get the scanner status from bill-please-mcp, throws when it is unreachable.
 * `busy` is true while the server's LLM queue is full.
 */
export const getReceiptScannerStatus =
  async (): Promise<IReceiptScannerStatus> => {
    const { data } = await axios.get<IReceiptScannerStatus>(
      `${getApiUrl()}/api/receipts/status`,
      { timeout: 5_000 },
    );
    return data;
  };

/** The server answered 503 because its LLM queue is full */
export const isReceiptScannerBusyError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 503;

/**
 * Send a receipt image to bill-please-mcp and get bill items back.
 * `turnstileToken` is sent as the `cf-turnstile-response` form field, which
 * the backend checks with Cloudflare's siteverify before running OCR.
 */
export const scanReceipt = async (
  image: File,
  turnstileToken?: string,
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
  const { data } = await axios.post<unknown>(
    `${apiUrl}/api/receipts/scan`,
    formData,
    { timeout: 60_000 },
  );
  return normalizeReceiptItems(data);
};
