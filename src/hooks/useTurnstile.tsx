import { useCallback, useEffect, useRef, useState } from 'react';

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  theme?: 'auto' | 'light' | 'dark';
  retry?: 'auto' | 'never';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'before-interactive-callback'?: () => void;
  'after-interactive-callback'?: () => void;
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

interface Waiter {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

/**
 * Run a Cloudflare Turnstile check when the component mounts. The widget
 * renders inside `containerRef`. `isWidgetVisible` is true only while
 * Cloudflare wants the visitor to tap the widget. The caller hides the
 * container the rest of the time, because Cloudflare leaves its "Success!"
 * box on screen after a tap.
 *
 * `status` tracks the first check, and `isPassed` turns true once the visitor
 * passes. The server accepts each token once. `getToken()` returns the current
 * token, or runs a new challenge and waits for it when the token is used or
 * expired. No challenge runs while the visitor isn't scanning, so the widget
 * can only ask for a tap right after the visitor picks a photo. Without
 * `VITE_APP_TURNSTILE_SITE_KEY` the check is skipped, `isPassed` is true and
 * `getToken()` resolves `undefined`.
 */
const useTurnstile = (action?: string) => {
  const siteKey = process.env.VITE_APP_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | undefined>(undefined);
  const waitersRef = useRef<Waiter[]>([]);
  // True while a challenge is running and its token has not arrived yet
  const isRunningRef = useRef(false);
  const [status, setStatus] = useState<TurnstileStatus>(
    siteKey ? 'verifying' : 'passed',
  );
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    let isCancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (isCancelled || !containerRef.current) return;
        isRunningRef.current = true;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          appearance: 'interaction-only',
          // The app has no dark mode, so a dark widget would clash with it
          theme: 'light',
          // getToken() starts each new challenge. An automatic retry or
          // refresh could ask for a tap while the visitor isn't scanning
          retry: 'never',
          'refresh-expired': 'never',
          callback: (token) => {
            isRunningRef.current = false;
            setIsWidgetVisible(false);
            const waiter = waitersRef.current.shift();
            if (waiter) {
              // A scan is waiting, so give it this token
              waiter.resolve(token);
            } else {
              tokenRef.current = token;
            }
            setStatus('passed');
          },
          // During a later scan the button stays and the widget shows under it
          'before-interactive-callback': () => {
            setIsWidgetVisible(true);
            setStatus((current) =>
              current === 'passed' ? current : 'interactive',
            );
          },
          'after-interactive-callback': () => setIsWidgetVisible(false),
          'error-callback': () => {
            isRunningRef.current = false;
            tokenRef.current = undefined;
            setIsWidgetVisible(false);
            const waiters = waitersRef.current;
            waitersRef.current = [];
            waiters.forEach((waiter) =>
              waiter.reject(new Error('Turnstile challenge failed')),
            );
            // If a later scan's check fails, keep the button so the visitor
            // can try again
            setStatus((current) => (current === 'passed' ? current : 'failed'));
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
      isRunningRef.current = false;
      waitersRef.current = [];
    };
  }, [siteKey, action]);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!siteKey) return undefined;

    const token = tokenRef.current;
    if (token) {
      tokenRef.current = undefined;
      return token;
    }

    // The token is used or expired. Start a new challenge unless one is
    // running already
    if (!isRunningRef.current && widgetIdRef.current) {
      isRunningRef.current = true;
      window.turnstile?.reset(widgetIdRef.current);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await new Promise<string>((resolve, reject) => {
        const waiter: Waiter = { resolve, reject };
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

  return {
    containerRef,
    getToken,
    status,
    isPassed: status === 'passed',
    isWidgetVisible,
  };
};

export default useTurnstile;
