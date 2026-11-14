import { createClient, Reason } from '@vercel/flags-core';
import { next } from '@vercel/functions';

import {
  APP_THEME_COOKIE,
  APP_THEME_FLAG,
  DEFAULT_APP_THEME,
  isAppTheme,
} from './src/config/theme';

// Vercel runs this before its cache, on the app's pages and on /api/theme.
// After the first visit the service worker answers page loads from its cache,
// so the app calls /api/theme to pick up flag changes
export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/mapping', '/result', '/api/theme'],
};

// The client reads the flag with the project's OIDC token. It loads the flag
// data on the first request, not here
const flags = createClient();

const ONE_YEAR = 60 * 60 * 24 * 365;

/** The Set-Cookie value for the flag's theme, or none if evaluation failed */
const themeCookie = async (): Promise<string | undefined> => {
  try {
    const result = await flags.evaluate<string>(
      APP_THEME_FLAG,
      DEFAULT_APP_THEME,
    );
    // On an error the client returns the default. Keep the visitor's last
    // theme instead
    if (result.reason === Reason.ERROR || !isAppTheme(result.value)) return;
    return `${APP_THEME_COOKIE}=${result.value}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax; Secure`;
  } catch {
    return;
  }
};

export default async function middleware(request: Request) {
  const cookie = await themeCookie();
  const headers: Record<string, string> = cookie
    ? { 'Set-Cookie': cookie }
    : {};
  if (new URL(request.url).pathname === '/api/theme') {
    return new Response(null, {
      status: 204,
      headers: { ...headers, 'Cache-Control': 'no-store' },
    });
  }
  return next({ headers });
}
