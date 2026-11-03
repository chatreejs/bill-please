import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import {
  getReceiptScanFailureReason,
  parseServerSentEvents,
  ReceiptScanError,
} from './receipt.util';

const httpError = (status: number, data: unknown = {}) =>
  new AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('getReceiptScanFailureReason', () => {
  it('tells the busy 503 apart from the Turnstile 503', () => {
    expect(
      getReceiptScanFailureReason(
        httpError(503, { error: 'busy', code: 'scanner_busy' }),
      ),
    ).toBe('busy');
    expect(
      getReceiptScanFailureReason(
        httpError(503, { error: 'Could not verify the Turnstile challenge' }),
      ),
    ).toBe('turnstile_unavailable');
    expect(
      getReceiptScanFailureReason(
        httpError(503, { error: 'down', code: 'scanner_unavailable' }),
      ),
    ).toBe('unavailable');
    expect(
      getReceiptScanFailureReason(
        new ReceiptScanError(503, 'scanner_unavailable'),
      ),
    ).toBe('unavailable');
  });

  it.each([
    [422, 'unreadable'],
    [429, 'rate_limited'],
    [403, 'turnstile_rejected'],
    [413, 'too_large'],
    [415, 'unsupported_type'],
    [502, 'server_error'],
    [400, 'unknown'],
  ])('maps HTTP %i to %s', (status, reason) => {
    expect(getReceiptScanFailureReason(httpError(status))).toBe(reason);
  });

  it('reports a timeout and a network error without a response', () => {
    expect(
      getReceiptScanFailureReason(new AxiosError('timeout', 'ECONNABORTED')),
    ).toBe('timeout');
    expect(
      getReceiptScanFailureReason(new AxiosError('down', 'ERR_NETWORK')),
    ).toBe('network');
  });

  it('reads the status and code of an error event from the scan stream', () => {
    expect(
      getReceiptScanFailureReason(new ReceiptScanError(503, 'scanner_busy')),
    ).toBe('busy');
    expect(getReceiptScanFailureReason(new ReceiptScanError(422))).toBe(
      'unreadable',
    );
  });

  it('reads the code from a text body, because a scan asks for text', () => {
    expect(
      getReceiptScanFailureReason(
        httpError(503, JSON.stringify({ code: 'scanner_busy' })),
      ),
    ).toBe('busy');
  });

  it('reports unknown for other errors', () => {
    expect(getReceiptScanFailureReason(new Error('boom'))).toBe('unknown');
  });
});

describe('parseServerSentEvents', () => {
  it('parses complete events and skips comments and the one still arriving', () => {
    const text = [
      'event: progress',
      'data: {"stage":"ocr"}',
      '',
      ': ping',
      '',
      'event: result',
      'data: {"items":[]}',
      '',
      'event: progress',
      'data: {"stage":"ll',
    ].join('\n');
    expect(parseServerSentEvents(text)).toEqual([
      { event: 'progress', data: { stage: 'ocr' } },
      { event: 'result', data: { items: [] } },
    ]);
  });

  it('accepts CRLF line endings', () => {
    expect(
      parseServerSentEvents('event: error\r\ndata: {"status":502}\r\n\r\n'),
    ).toEqual([{ event: 'error', data: { status: 502 } }]);
  });
});
