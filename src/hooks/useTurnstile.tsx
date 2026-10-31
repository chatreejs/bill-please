import { useCallback, useEffect, useRef, useState } from 'react';

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'before-interactive-callback'?: () => void;
  callback?: (token: string) => void;
  'error-callback'?: (errorCode: string) => void;
  'expired-callback'?: () => void;
}

interface Turnstile {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_TIMEOUT_MS = 60_000;

/**
 * - `verifying`: the invisible check is running
 * - `interactive`: Cloudflare wants the visitor to click the widget
 * - `passed`: a token was issued
 * - `failed`: the check errored or the script could not load
 */
export type TurnstileStatus = 'verifying' | 'interactive' | 'passed' | 'failed';

let scriptPromise: Promise<Turnstile> | undefined;

/**
 * Load the Turnstile script once per page, shared by every widget.
 */
const loadTurnstile = (): Promise<Turnstile> => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error('Turnstile failed to initialise'));
    script.onerror = () => {
      scriptPromise = undefined;
      script.remove();
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/**
 * Run a Cloudflare Turnstile check as soon as the component mounts. The widget
 * stays hidden unless Cloudflare wants the visitor to interact, in which case
 * it shows inside `containerRef`.
 *
 * `status` tracks the check, and `isPassed` turns true once the visitor passes. `getToken()` hands out the
 * current token and starts a fresh challenge in the background, since each
 * token can only be verified once. Without `VITE_APP_TURNSTILE_SITE_KEY` the
 * check is skipped: `isPassed` is true and `getToken()` resolves `undefined`.
 */
const useTurnstile = (action?: string) => {
  const siteKey = process.env.VITE_APP_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | undefined>(undefined);
  const waitersRef = useRef<((token: string) => void)[]>([]);
  const [status, setStatus] = useState<TurnstileStatus>(
    siteKey ? 'verifying' : 'passed',
  );

  useEffect(() => {
    if (!siteKey) return;
    let isCancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (isCancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: (token) => {
            const waiter = waitersRef.current.shift();
            if (waiter) {
              // A scan is already waiting: hand this token straight over and
              // start the next challenge
              waiter(token);
              if (widgetIdRef.current) turnstile.reset(widgetIdRef.current);
            } else {
              tokenRef.current = token;
            }
            setStatus('passed');
          },
          // Background re-checks after a pass keep the button visible
          'before-interactive-callback': () =>
            setStatus((current) =>
              current === 'passed' ? current : 'interactive',
            ),
          'error-callback': () => {
            tokenRef.current = undefined;
            setStatus('failed');
          },
          'expired-callback': () => {
            tokenRef.current = undefined;
          },
        });
      })
      .catch(() => {
        // Script blocked or offline: the visitor never passes
        if (!isCancelled) setStatus('failed');
      });

    return () => {
      isCancelled = true;
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
      tokenRef.current = undefined;
      waitersRef.current = [];
    };
  }, [siteKey, action]);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!siteKey) return undefined;

    const token = tokenRef.current;
    if (token) {
      tokenRef.current = undefined;
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      return token;
    }

    // The next challenge is still running: wait for its token
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await new Promise<string>((resolve, reject) => {
        const waiter = (next: string) => resolve(next);
        waitersRef.current.push(waiter);
        timer = setTimeout(() => {
          waitersRef.current = waitersRef.current.filter((w) => w !== waiter);
          reject(new Error('Turnstile challenge timed out'));
        }, TOKEN_TIMEOUT_MS);
      });
    } finally {
      clearTimeout(timer);
    }
  }, [siteKey]);

  return { containerRef, getToken, status, isPassed: status === 'passed' };
};

export default useTurnstile;
