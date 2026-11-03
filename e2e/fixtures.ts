import { test as base, expect, Route } from '@playwright/test';

export const MOCK_MCP_URL = 'http://mcp.test';

export interface ReceiptApi {
  /** Make the GET /api/receipts/status stream succeed or fail */
  setHealthy: (healthy: boolean) => void;
  /** Report the LLM queue as full (busy) or with room */
  setBusy: (busy: boolean) => void;
  /** Report the server's OCR and LLM as up or down */
  setAvailable: (available: boolean) => void;
  /** Respond to the next scans with this handler */
  onScan: (handler: (route: Route) => Promise<void> | void) => void;
}

export interface GitHubTags {
  /** Versions returned by the GitHub tags API, e.g. ['0.10.0', '99.0.0'] */
  set: (versions: string[]) => void;
}

/**
 * Stubs GitHub and the receipt backend and blocks every other external host,
 * so no test reaches the network.
 */
export const test = base.extend<{
  receiptApi: ReceiptApi;
  githubTags: GitHubTags;
}>({
  githubTags: [
    async ({ context }, use) => {
      let versions: string[] = [];
      await context.route(
        'https://api.github.com/repos/chatreejs/bill-please/git/refs/tags',
        (route) =>
          route.fulfill({
            json: versions.map((v) => ({ ref: `refs/tags/v${v}` })),
          }),
      );
      await use({ set: (next) => (versions = next) });
    },
    { auto: true },
  ],

  receiptApi: [
    async ({ context }, use) => {
      let healthy = false;
      let busy = false;
      let available = true;
      let scanHandler: (route: Route) => Promise<void> | void = (route) =>
        route.fulfill({ status: 500 });

      // route.fulfill can't stream, so each answer is one status event that ends.
      // EventSource then reconnects after `retry` ms and gets the current state
      await context.route(`${MOCK_MCP_URL}/api/receipts/status`, (route) =>
        healthy
          ? route.fulfill({
              contentType: 'text/event-stream',
              body: `retry: 500\n\nevent: status\ndata: ${JSON.stringify({ status: 'ok', busy, available })}\n\n`,
            })
          : route.fulfill({ status: 503 }),
      );
      await context.route(`${MOCK_MCP_URL}/api/receipts/scan`, (route) =>
        scanHandler(route),
      );
      await use({
        setHealthy: (next) => (healthy = next),
        setBusy: (next) => (busy = next),
        setAvailable: (next) => (available = next),
        onScan: (handler) => (scanHandler = handler),
      });
    },
    { auto: true },
  ],

  // Block every other request that leaves localhost, such as analytics
  context: async ({ context }, use) => {
    await context.route(
      /^https?:\/\/(?!localhost|127\.0\.0\.1|mcp\.test|api\.github\.com|challenges\.cloudflare\.com)/,
      (route) => route.abort(),
    );
    await use(context);
  },
});

export { expect };
