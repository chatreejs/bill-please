import { describe, expect, it } from 'vitest';

import { IAppState } from '@interfaces';
import appReducer, { addExchangeRate, setMainCurrency } from './AppSlice';

const state = (): IAppState => ({
  vatPercentage: 7,
  mainCurrency: 'THB',
  displayCurrency: 'THB',
  exchangeRates: [{ currency: 'USD', rate: 0.03 }],
});

describe('addExchangeRate', () => {
  it('adds a rate for another currency', () => {
    const next = appReducer(
      state(),
      addExchangeRate({ currency: 'JPY', rate: 4.2 }),
    );
    expect(next.exchangeRates).toEqual([
      { currency: 'USD', rate: 0.03 },
      { currency: 'JPY', rate: 4.2 },
    ]);
  });

  it('replaces the rate of a currency that already has one', () => {
    const next = appReducer(
      state(),
      addExchangeRate({ currency: 'USD', rate: 0.028 }),
    );
    expect(next.exchangeRates).toEqual([{ currency: 'USD', rate: 0.028 }]);
  });

  it('ignores a rate for the base currency', () => {
    const next = appReducer(
      state(),
      addExchangeRate({ currency: 'THB', rate: 10 }),
    );
    expect(next.exchangeRates).toEqual([{ currency: 'USD', rate: 0.03 }]);
  });

  it('ignores a rate for a base currency changed after the form opened', () => {
    const switched = appReducer(state(), setMainCurrency('JPY'));
    const next = appReducer(
      switched,
      addExchangeRate({ currency: 'JPY', rate: 10 }),
    );
    expect(next.exchangeRates).toEqual([]);
  });
});
