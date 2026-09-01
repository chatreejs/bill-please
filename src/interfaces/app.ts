import { ICurrencyExchangeRate } from './currency';

export interface IAppState {
  vatPercentage: number;
  mainCurrency: string;
  displayCurrency: string;
  exchangeRates: ICurrencyExchangeRate[];
}
