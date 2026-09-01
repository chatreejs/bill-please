export interface ICurrencyExchangeRate {
  /** The target currency code (e.g., "THB") */
  currency: string;
  /** How many units of target currency equal 1 unit of main currency */
  rate: number;
}
