export const CURRENCIES = [
  { code: 'THB', symbol: '฿' },
  { code: 'JPY', symbol: '¥' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CNY', symbol: '¥' },
  { code: 'KRW', symbol: '₩' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
};
