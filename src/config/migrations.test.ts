import { PersistedState } from 'redux-persist';
import { describe, expect, it } from 'vitest';

import { migrations } from './migrations';

describe('migration 2', () => {
  it('turns payer id lists into shares with weight 1', () => {
    const state = {
      _persist: { version: 1, rehydrated: false },
      bill: {
        title: 'Dinner',
        itemMapping: [
          { itemId: 'pizza', payerId: ['p1', 'f1'] },
          { itemId: 'beer', payerId: [] },
        ],
      },
    } as unknown as PersistedState;

    expect(migrations[2](state)).toEqual({
      _persist: { version: 1, rehydrated: false },
      bill: {
        title: 'Dinner',
        itemMapping: [
          {
            itemId: 'pizza',
            shares: [
              { payerId: 'p1', weight: 1 },
              { payerId: 'f1', weight: 1 },
            ],
          },
          { itemId: 'beer', shares: [] },
        ],
      },
    });
  });

  it('keeps mappings that already have shares', () => {
    const shares = [{ payerId: 'p1', weight: 2 }];
    const state = {
      _persist: { version: 1, rehydrated: false },
      bill: { itemMapping: [{ itemId: 'a', shares }] },
    } as unknown as PersistedState;

    expect(migrations[2](state)).toMatchObject({
      bill: { itemMapping: [{ itemId: 'a', shares }] },
    });
  });

  it('drops an exchange rate for the base currency', () => {
    const state = {
      _persist: { version: 1, rehydrated: false },
      app: {
        mainCurrency: 'JPY',
        displayCurrency: 'JPY',
        exchangeRates: [
          { currency: 'JPY', rate: 10 },
          { currency: 'USD', rate: 0.0067 },
        ],
      },
    } as unknown as PersistedState;

    expect(migrations[2](state)).toEqual({
      _persist: { version: 1, rehydrated: false },
      app: {
        mainCurrency: 'JPY',
        displayCurrency: 'JPY',
        exchangeRates: [{ currency: 'USD', rate: 0.0067 }],
      },
    });
  });

  it('leaves a state without a bill or app alone', () => {
    const state = {
      _persist: { version: 1, rehydrated: false },
    } as unknown as PersistedState;
    expect(migrations[2](state)).toBe(state);
  });
});
