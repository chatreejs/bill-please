import { describe, expect, it } from 'vitest';

import { compareVersions, isNewerVersion } from './version.util';

describe('compareVersions', () => {
  it.each([
    ['0.10.0', '0.9.9'],
    ['1.0.0', '0.99.99'],
    ['0.11.1', '0.11.0'],
  ])('%s > %s (numeric, not lexical)', (a, b) => {
    expect(compareVersions(a, b)).toBeGreaterThan(0);
    expect(compareVersions(b, a)).toBeLessThan(0);
  });

  it.each([
    ['0.11.0', '0.11.0-beta.1'],
    ['0.11.2', '0.11.0-beta.1'],
    ['0.12.0', '0.11.0-beta.1'],
    ['0.11.0-beta.1', '0.10.5'],
  ])('%s > %s (pre-release ordering)', (a, b) => {
    expect(compareVersions(a, b)).toBeGreaterThan(0);
    expect(compareVersions(b, a)).toBeLessThan(0);
  });

  it.each([
    ['0.11.0-beta.2', '0.11.0-beta.1'],
    ['0.11.0-beta.10', '0.11.0-beta.9'],
    ['0.11.0-rc.1', '0.11.0-beta.5'],
    ['0.11.0-beta.1', '0.11.0-beta'],
    ['0.11.0-alpha', '0.11.0-1'],
  ])('%s > %s (between pre-releases)', (a, b) => {
    expect(compareVersions(a, b)).toBeGreaterThan(0);
    expect(compareVersions(b, a)).toBeLessThan(0);
  });

  it.each([
    ['0.11.0', '0.11.0'],
    ['v0.11.0', '0.11.0'],
    ['0.11', '0.11.0'],
    ['0.11.0-beta.1', 'v0.11.0-beta.1'],
  ])('%s == %s', (a, b) => {
    expect(compareVersions(a, b)).toBe(0);
  });

  it('never returns NaN', () => {
    expect(compareVersions('0.11.0', '0.11.0-beta.1')).not.toBeNaN();
    expect(compareVersions('x.y', '0.1.0')).not.toBeNaN();
  });
});

describe('isNewerVersion', () => {
  it('offers the final release to pre-release users', () => {
    expect(isNewerVersion('0.11.0-beta.1', '0.11.0')).toBe(true);
    expect(isNewerVersion('0.11.0-beta.1', '0.11.3')).toBe(true);
  });

  it('does not offer the same or an older version', () => {
    expect(isNewerVersion('0.11.0', '0.11.0')).toBe(false);
    expect(isNewerVersion('0.11.0', '0.10.9')).toBe(false);
    expect(isNewerVersion('0.11.0', '0.11.0-beta.1')).toBe(false);
  });
});
