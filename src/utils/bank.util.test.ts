import { describe, expect, it } from 'vitest';

import { IBank } from '@interfaces';
import {
  ACCOUNT_NUMBER_MASK,
  ACCOUNT_NUMBER_MAX_LENGTH,
  BANKS,
  formatAccountNumber,
  getBank,
  getBankName,
  isValidAccountNumber,
} from './bank.util';

const bank = (minDigits: number, maxDigits: number): IBank => ({
  id: 'TEST',
  code: '000',
  name: { en: 'Test Bank', th: 'ธนาคารทดสอบ' },
  color: '#000000',
  minDigits,
  maxDigits,
});

const maskDigits = [...ACCOUNT_NUMBER_MASK].filter((c) => c === 'X').length;

describe('bank config', () => {
  it('has unique ids and codes', () => {
    expect(new Set(BANKS.map((b) => b.id)).size).toBe(BANKS.length);
    expect(new Set(BANKS.map((b) => b.code)).size).toBe(BANKS.length);
  });

  it('gives every bank a name, a logo and a digit range the mask fits', () => {
    BANKS.forEach((b) => {
      expect(b.name.en).toBeTruthy();
      expect(b.icon).toBe(`/banks/${b.id}.png`);
      expect(b.minDigits).toBeGreaterThan(0);
      expect(b.maxDigits).toBeGreaterThanOrEqual(b.minDigits);
      expect(b.maxDigits).toBeLessThanOrEqual(maskDigits);
    });
  });

  it('allows 19 characters in the box', () => {
    expect(ACCOUNT_NUMBER_MAX_LENGTH).toBe(19);
  });

  it('finds a bank by id', () => {
    expect(getBank('SCB')?.code).toBe('014');
    expect(getBank('NOPE')).toBeUndefined();
    expect(getBank(undefined)).toBeUndefined();
  });
});

describe('getBankName', () => {
  it('uses the language and falls back to English', () => {
    expect(getBankName(bank(10, 10), 'th')).toBe('ธนาคารทดสอบ');
    expect(getBankName(bank(10, 10), 'ja')).toBe('Test Bank');
  });
});

describe('formatAccountNumber', () => {
  it('formats a 10-digit number', () => {
    expect(formatAccountNumber('1234567890')).toBe('123-4-56789-0');
  });

  it('keeps longer numbers in the last group', () => {
    expect(formatAccountNumber('123456789012')).toBe('123-4-56789-012');
    expect(formatAccountNumber('123456789012345')).toBe('123-4-56789-012345');
  });

  it('formats while typing without a trailing dash', () => {
    expect(formatAccountNumber('123')).toBe('123');
    expect(formatAccountNumber('1234')).toBe('123-4');
    expect(formatAccountNumber('123456789')).toBe('123-4-56789');
  });

  it('ignores anything that is not a digit', () => {
    expect(formatAccountNumber('123-4 567a89-0')).toBe('123-4-56789-0');
  });

  it('drops digits past the mask', () => {
    expect(formatAccountNumber('12345678901234567890')).toBe(
      '123-4-56789-0123456',
    );
  });

  it('returns an empty string for no digits', () => {
    expect(formatAccountNumber('')).toBe('');
  });
});

describe('isValidAccountNumber', () => {
  it('accepts a number within the bank’s digit range', () => {
    expect(isValidAccountNumber('123-4-56789-0', bank(10, 10))).toBe(true);
    expect(isValidAccountNumber('123456789012', bank(12, 15))).toBe(true);
    expect(isValidAccountNumber('123456789012345', bank(12, 15))).toBe(true);
  });

  it('rejects a number outside the range', () => {
    expect(isValidAccountNumber('123456789', bank(10, 10))).toBe(false);
    expect(isValidAccountNumber('12345678901', bank(10, 10))).toBe(false);
    expect(isValidAccountNumber('1234567890', bank(12, 15))).toBe(false);
    expect(isValidAccountNumber('1234567890123456', bank(12, 15))).toBe(false);
  });
});
