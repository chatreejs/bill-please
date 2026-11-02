export interface IBank {
  /** Short name, such as SCB, also used for the logo file name */
  id: string;
  /** Bank of Thailand bank code, such as 014 */
  code: string;
  /** Name per language. Other languages fall back to en */
  name: Record<string, string>;
  /** Logo image URL. Without one, or if it fails to load, the badge shows the id on the color */
  icon?: string;
  /** Badge background when there is no logo */
  color: string;
  /** Badge text when there is no logo. Defaults to white */
  textColor?: string;
  /** Fewest digits an account number of this bank has */
  minDigits: number;
  /** Most digits an account number of this bank has */
  maxDigits: number;
}

export interface IBankAccount {
  bankId: string;
  /** Digits only */
  accountNumber: string;
}
