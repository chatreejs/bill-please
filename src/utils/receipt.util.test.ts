import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getReceiptScanFailureReason } from './receipt.util';

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

  it('reports unknown for other errors', () => {
    expect(getReceiptScanFailureReason(new Error('boom'))).toBe('unknown');
  });
});
