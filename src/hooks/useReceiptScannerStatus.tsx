import { useEffect, useState } from 'react';

import { IReceiptScannerStatus } from '@interfaces';
import { getReceiptScannerStatusUrl } from '@utils';

// Wait this long before opening a new stream after the server refused one,
// with an error status or with JSON from an older server
const RECONNECT_MS = 5_000;
// Keep the last status this long while EventSource reconnects a dropped stream,
// so the button doesn't flicker when a proxy closes an idle connection
const RECONNECT_GRACE_MS = 10_000;

export interface ReceiptScannerStatusState {
  /** The latest status from bill-please-api */
  status?: IReceiptScannerStatus;
  /** The status stream is open, or reconnecting within the grace period */
  isHealthy: boolean;
}

/**
 * Keeps a Server-Sent Events stream of GET /api/receipts/status open, so
 * "Add from bill" turns off and back on as soon as the server's LLM queue
 * fills up or has room again. The hook closes the stream while the tab is hidden.
 */
const useReceiptScannerStatus = (): ReceiptScannerStatusState => {
  const [state, setState] = useState<ReceiptScannerStatusState>({
    isHealthy: false,
  });

  useEffect(() => {
    const url = getReceiptScannerStatusUrl();
    if (!url || typeof EventSource === 'undefined') return;

    let source: EventSource | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    const markDown = () => {
      clearTimeout(graceTimer);
      graceTimer = undefined;
      setState((prev) => ({ ...prev, isHealthy: false }));
    };

    const close = () => {
      clearTimeout(reconnectTimer);
      clearTimeout(graceTimer);
      reconnectTimer = undefined;
      graceTimer = undefined;
      source?.close();
      source = undefined;
    };

    const open = () => {
      close();
      const next = new EventSource(url);
      source = next;
      next.addEventListener('status', (event) => {
        try {
          const status = JSON.parse(
            (event as MessageEvent<string>).data,
          ) as IReceiptScannerStatus;
          clearTimeout(graceTimer);
          graceTimer = undefined;
          setState({ status, isHealthy: true });
        } catch {
          // Ignore a malformed event and keep the last status
        }
      });
      next.onerror = () => {
        if (next.readyState === EventSource.CLOSED) {
          // EventSource gives up on an error status or a non-SSE answer
          markDown();
          reconnectTimer = setTimeout(open, RECONNECT_MS);
        } else {
          // EventSource retries a dropped stream by itself
          graceTimer ??= setTimeout(markDown, RECONNECT_GRACE_MS);
        }
      };
    };

    const onVisibilityChange = () => {
      if (document.hidden) close();
      else if (!source) open();
    };

    if (!document.hidden) open();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      close();
    };
  }, []);

  return state;
};

export default useReceiptScannerStatus;
