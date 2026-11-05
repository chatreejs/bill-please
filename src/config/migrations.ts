import { MigrationManifest, PersistedState } from 'redux-persist';

import { IAppState, IBillItemMapping } from '@interfaces';

type PersistedRootState = PersistedState & {
  app?: Partial<IAppState>;
  bill?: {
    itemMapping?: (Partial<IBillItemMapping> & { payerId?: string[] })[];
  };
};

// Users who upgraded from before v0.9.0 have a persisted `app` slice without
// mainCurrency/displayCurrency. autoMergeLevel1 (the default reconciler)
// replaces the whole slice, so those fields rehydrate as undefined. Backfill
// them with the 'THB' default.
export const migrations: MigrationManifest = {
  1: (state: PersistedState) => {
    const rootState = state as PersistedRootState;
    return {
      ...rootState,
      app: {
        ...rootState.app,
        mainCurrency: rootState.app?.mainCurrency ?? 'THB',
        displayCurrency: rootState.app?.displayCurrency ?? 'THB',
        exchangeRates: rootState.app?.exchangeRates ?? [],
      },
    };
  },
  // Before uneven splits, a mapping listed its payers as `payerId: string[]`
  // and split the item equally. Give each of them weight 1, which splits the
  // same way.
  2: (state: PersistedState) => {
    const rootState = state as PersistedRootState;
    if (!rootState.bill) return rootState;
    return {
      ...rootState,
      bill: {
        ...rootState.bill,
        itemMapping: (rootState.bill.itemMapping ?? []).map((mapping) => ({
          itemId: mapping.itemId,
          shares:
            mapping.shares ??
            (mapping.payerId ?? []).map((payerId) => ({ payerId, weight: 1 })),
        })),
      },
    } as PersistedState;
  },
  // Before the fix for #71, a user could open the add rate form, switch the
  // base currency to the form's target, and save "1 JPY = 10 JPY". Drop
  // rates for the base currency.
  3: (state: PersistedState) => {
    const rootState = state as PersistedRootState;
    if (!rootState.app?.exchangeRates) return rootState;
    const { mainCurrency, exchangeRates } = rootState.app;
    return {
      ...rootState,
      app: {
        ...rootState.app,
        exchangeRates: exchangeRates.filter((r) => r.currency !== mainCurrency),
      },
    } as PersistedState;
  },
};
