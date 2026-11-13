import { beforeEach, describe, expect, it, vi } from 'vitest';

const ga = vi.hoisted(() => ({
  initialize: vi.fn(),
  send: vi.fn(),
  event: vi.fn(),
}));
vi.mock('react-ga4', () => ({ default: ga }));

describe('trackPageView', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_APP_GA_MEASUREMENT_ID', 'G-TEST');
  });

  it('sends a pageview hit that react-ga4 knows', async () => {
    const { trackPageView } = await import('./analytics.util');
    trackPageView('/result');

    expect(ga.send).toHaveBeenCalledWith({
      hitType: 'pageview',
      page: '/result',
      title: 'Result',
    });
  });

  it('turns off the page view gtag sends on init', async () => {
    const { trackPageView } = await import('./analytics.util');
    trackPageView('/');

    const [id, options] = ga.initialize.mock.calls[0] as [
      string,
      { gtagOptions: Record<string, unknown> },
    ];
    expect(id).toBe('G-TEST');
    expect(options.gtagOptions.send_page_view).toBe(false);
  });

  it('sends nothing without a measurement ID', async () => {
    vi.stubEnv('VITE_APP_GA_MEASUREMENT_ID', '');
    const { trackPageView } = await import('./analytics.util');
    trackPageView('/');

    expect(ga.initialize).not.toHaveBeenCalled();
    expect(ga.send).not.toHaveBeenCalled();
  });
});
