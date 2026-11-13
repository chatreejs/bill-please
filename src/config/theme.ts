export const APP_THEMES = [
  'default',
  'loy-krathong',
  'christmas',
  'new-year',
  'chinese-new-year',
  'songkran',
] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_THEME: AppTheme = 'default';

export interface AppThemeColors {
  /** Buttons, links, tabs and other antd primary elements */
  primary: string;
  /** Page background around the bill card, and the browser bar */
  background: string;
  /** Light fill behind primary text, such as the Turnstile placeholder */
  primaryTint: string;
  /** Translucent primary for the light sweep while Turnstile checks */
  primaryShimmer: string;
  /** The "Bill Please" logo text */
  logo: string;
  /** The three stops of the "Add from bill" button's border and sparkle */
  aiGradient: [string, string, string];
}

export const APP_THEME_COLORS: Record<AppTheme, AppThemeColors> = {
  default: {
    primary: '#2c9c91',
    background: '#2c9c91',
    primaryTint: '#f0faf9',
    primaryShimmer: 'rgba(44, 156, 145, 0.18)',
    logo: '#fafafa',
    aiGradient: ['#2c9c91', '#3b82f6', '#a855f7'],
  },
  // Night blue with gold
  'loy-krathong': {
    primary: '#9a6a08',
    background: '#13294b',
    primaryTint: '#fbf5e6',
    primaryShimmer: 'rgba(154, 106, 8, 0.16)',
    logo: '#fafafa',
    aiGradient: ['#d9a43a', '#f0cf7a', '#5b8bd6'],
  },
  christmas: {
    primary: '#c0283a',
    background: '#1d5c45',
    primaryTint: '#fdf1f2',
    primaryShimmer: 'rgba(192, 40, 58, 0.16)',
    logo: '#fafafa',
    aiGradient: ['#c0283a', '#c9930e', '#1d7a52'],
  },
  // Dark purple with violet
  'new-year': {
    primary: '#6d28d9',
    background: '#1b1240',
    primaryTint: '#f4effd',
    primaryShimmer: 'rgba(109, 40, 217, 0.16)',
    logo: '#fafafa',
    aiGradient: ['#6d28d9', '#d4a020', '#e0559b'],
  },
  // Red envelope colors, deep red and gold
  'chinese-new-year': {
    primary: '#a8101e',
    background: '#9b0f1a',
    primaryTint: '#fbf3e8',
    primaryShimmer: 'rgba(184, 134, 11, 0.18)',
    logo: '#f3d27a',
    aiGradient: ['#b8860b', '#e9c46a', '#a8101e'],
  },
  // Aqua and blue
  songkran: {
    primary: '#0369a1',
    background: '#0891b2',
    primaryTint: '#ecf7fc',
    primaryShimmer: 'rgba(3, 105, 161, 0.16)',
    logo: '#fafafa',
    aiGradient: ['#06b6d4', '#0369a1', '#f472b6'],
  },
};

export const isAppTheme = (value: unknown): value is AppTheme =>
  APP_THEMES.includes(value as AppTheme);

/**
 * Pick the theme for this visit. A `?theme=` URL parameter, for previews,
 * wins over `VITE_APP_THEME`, and `default` is the fallback. An unknown name counts as
 * unset. The `app-theme` Vercel flag will take the place of the env var.
 */
export const resolveAppTheme = (
  search: string,
  envTheme: string | undefined,
): AppTheme => {
  const fromUrl = new URLSearchParams(search).get('theme');
  if (isAppTheme(fromUrl)) return fromUrl;
  if (isAppTheme(envTheme)) return envTheme;
  return DEFAULT_APP_THEME;
};

let currentTheme: AppTheme = DEFAULT_APP_THEME;

/** The theme applied by `applyAppTheme`, fixed for the whole visit */
export const getAppTheme = (): AppTheme => currentTheme;

/**
 * Set the theme's colors as CSS variables on `<html>`, mark it with
 * `data-theme`, and color the browser bar. Call it once before the first
 * render.
 */
export const applyAppTheme = (theme: AppTheme) => {
  currentTheme = theme;
  const colors = APP_THEME_COLORS[theme];
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.setProperty('--app-primary', colors.primary);
  root.style.setProperty('--app-background', colors.background);
  root.style.setProperty('--app-primary-tint', colors.primaryTint);
  root.style.setProperty('--app-primary-shimmer', colors.primaryShimmer);
  root.style.setProperty('--app-logo', colors.logo);
  colors.aiGradient.forEach((color, index) =>
    root.style.setProperty(`--app-ai-gradient-${index + 1}`, color),
  );
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', colors.background);
};
