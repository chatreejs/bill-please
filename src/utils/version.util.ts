interface ParsedVersion {
  core: number[];
  preRelease: string[];
}

const parseVersion = (version: string): ParsedVersion => {
  const [core, preRelease] = version.replace(/^v/, '').split('-', 2);
  return {
    core: core.split('.').map((part) => Number(part) || 0),
    preRelease: preRelease ? preRelease.split('.') : [],
  };
};

const comparePreRelease = (a: string[], b: string[]): number => {
  // With equal cores, a release is newer than its pre-releases
  // (0.11.0 > 0.11.0-beta.1)
  if (a.length === 0 || b.length === 0) return b.length - a.length;

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    // If one is a prefix of the other, the longer one is newer (beta < beta.1)
    if (x === undefined) return -1;
    if (y === undefined) return 1;

    const xNumber = Number(x);
    const yNumber = Number(y);
    const isXNumeric = !Number.isNaN(xNumber);
    const isYNumeric = !Number.isNaN(yNumber);
    if (isXNumeric && isYNumeric) {
      if (xNumber !== yNumber) return xNumber - yNumber;
    } else if (isXNumeric !== isYNumeric) {
      // Numeric identifiers sort before alphanumeric ones
      return isXNumeric ? -1 : 1;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
};

/**
 * Compare two versions using semver ordering. Returns a positive number when
 * `a` is newer, negative when `b` is newer and 0 when they are equal.
 * It ignores a leading `v`.
 */
export const compareVersions = (a: string, b: string): number => {
  const x = parseVersion(a);
  const y = parseVersion(b);
  const length = Math.max(x.core.length, y.core.length);
  for (let i = 0; i < length; i++) {
    const diff = (x.core[i] ?? 0) - (y.core[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return comparePreRelease(x.preRelease, y.preRelease);
};

export const isNewerVersion = (current: string, latest: string): boolean =>
  compareVersions(latest, current) > 0;
