interface UADataBrand {
  brand: string;
  version: string;
}

interface UADataValues {
  platform?: string;
  platformVersion?: string;
  model?: string;
  mobile?: boolean;
  fullVersionList?: UADataBrand[];
}

interface NavigatorUAData {
  brands: UADataBrand[];
  mobile: boolean;
  platform: string;
  getHighEntropyValues: (hints: string[]) => Promise<UADataValues>;
}

export interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
}

const BROWSER_PATTERNS: [string, RegExp][] = [
  ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
  ['Opera', /(?:OPR|OPiOS)\/([\d.]+)/],
  ['LINE', /Line\/([\d.]+)/],
  ['Facebook', /FBAV\/([\d.]+)/],
  ['Instagram', /Instagram ([\d.]+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
  ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
  ['Safari', /Version\/([\d.]+).*Safari/],
];

const parseBrowser = (ua: string) => {
  for (const [name, pattern] of BROWSER_PATTERNS) {
    const match = ua.match(pattern);
    if (match) return `${name} ${match[1]}`;
  }
  return 'Unknown';
};

const parseOS = (ua: string) => {
  let match = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/);
  if (match) return `iOS ${match[1].replace(/_/g, '.')}`;
  match = ua.match(/Android ([\d.]+)/);
  if (match) return `Android ${match[1]}`;
  match = ua.match(/Windows NT ([\d.]+)/);
  if (match) return `Windows NT ${match[1]}`;
  match = ua.match(/Mac OS X ([\d_]+)/);
  if (match) return `macOS ${match[1].replace(/_/g, '.')}`;
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
};

const parseDevice = (ua: string) => {
  if (/iPad/.test(ua)) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  // iPadOS reports itself as macOS; tell them apart by touch support.
  if (/Macintosh/.test(ua)) {
    return navigator.maxTouchPoints > 1 ? 'iPad' : 'Mac';
  }
  const android = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build\/[^;)]*)?\)/);
  if (android && android[1] !== 'K') return android[1].trim();
  if (/Android/.test(ua)) return 'Android device';
  if (/Windows/.test(ua)) return 'Windows PC';
  return 'Unknown';
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const ua = navigator.userAgent;
  const info: DeviceInfo = {
    device: parseDevice(ua),
    os: parseOS(ua),
    browser: parseBrowser(ua),
  };

  // Chromium hides model and OS version in the reduced UA string, but
  // exposes them through User-Agent Client Hints.
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
    .userAgentData;
  if (!uaData) return info;

  try {
    const values = await uaData.getHighEntropyValues([
      'model',
      'platformVersion',
      'fullVersionList',
    ]);
    if (values.model) info.device = values.model;
    if (values.platform && values.platformVersion) {
      info.os = `${values.platform} ${values.platformVersion}`;
    }
    const brand = values.fullVersionList?.find(
      (b) => !/Not.?A.?Brand|Chromium/i.test(b.brand),
    );
    if (brand) info.browser = `${brand.brand} ${brand.version}`;
  } catch {
    // Fall back to the parsed user agent.
  }
  return info;
};
