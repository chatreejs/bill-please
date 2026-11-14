import { describe, expect, it } from 'vitest';

import { readThemeCookie, resolveAppTheme } from './theme';

describe('resolveAppTheme', () => {
  it('uses the default theme when nothing picks one', () => {
    expect(resolveAppTheme('', undefined)).toBe('default');
  });

  it('uses the flag theme', () => {
    expect(resolveAppTheme('', 'christmas')).toBe('christmas');
  });

  it('lets the URL override the flag theme', () => {
    expect(resolveAppTheme('?theme=default', 'christmas')).toBe('default');
    expect(resolveAppTheme('?lang=th&theme=songkran', undefined)).toBe(
      'songkran',
    );
  });

  it('ignores unknown theme names', () => {
    expect(resolveAppTheme('?theme=halloween', undefined)).toBe('default');
    expect(resolveAppTheme('?theme=halloween', 'christmas')).toBe('christmas');
    expect(resolveAppTheme('', 'Christmas')).toBe('default');
  });
});

describe('readThemeCookie', () => {
  it('finds the theme among other cookies', () => {
    expect(readThemeCookie('_ga=GA1.1; bp-theme=new-year; lang=th')).toBe(
      'new-year',
    );
  });

  it('returns undefined without the cookie', () => {
    expect(readThemeCookie('')).toBeUndefined();
    expect(readThemeCookie('xbp-theme=christmas')).toBeUndefined();
  });
});
