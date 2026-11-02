import { IBank } from '@interfaces';
import bankConfig from '../config/banks.json';

export const BANKS: IBank[] = bankConfig.banks;

/** The mask every bank uses. Each X is one digit, anything else is printed as is */
export const ACCOUNT_NUMBER_MASK = bankConfig.accountNumberMask;

/** Characters in the full mask, dashes included */
export const ACCOUNT_NUMBER_MAX_LENGTH = ACCOUNT_NUMBER_MASK.length;

const MASK_DIGITS = [...ACCOUNT_NUMBER_MASK].filter(
  (char) => char === 'X',
).length;

export const getBank = (id: string | undefined): IBank | undefined =>
  BANKS.find((bank) => bank.id === id);

export const getBankName = (bank: IBank, language: string): string =>
  bank.name[language] ?? bank.name.en ?? bank.id;

export const toDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * Put the digits into the mask. Digits past the mask are dropped, and no
 * dash is added after the last digit.
 */
export const formatAccountNumber = (value: string): string => {
  const digits = toDigits(value).slice(0, MASK_DIGITS);

  let result = '';
  let index = 0;
  for (const char of ACCOUNT_NUMBER_MASK) {
    if (index >= digits.length) break;
    if (char === 'X') {
      result += digits[index];
      index += 1;
    } else {
      result += char;
    }
  }
  return result;
};

export const isValidAccountNumber = (value: string, bank: IBank): boolean => {
  const { length } = toDigits(value);
  return length >= bank.minDigits && length <= bank.maxDigits;
};
