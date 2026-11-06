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
  // Upgrades the store of a user who last used a version before 0.11.0. Those
  // versions saved it as persist version 1.
  //
  // Before 0.11.0 added uneven splits, a mapping listed its payers as `payerId: string[]`
  // and split the item equally. Give each of them weight 1, which splits the
  // same way.
  //
  // Before the fix for #71, a user could open the add rate form, switch the
  // base currency to the form's target, and save "1 JPY = 10 JPY". Drop
  // rates for the base currency.
  2: (state: PersistedState) => {
    const rootState = state as PersistedRootState;
    const { app, bill } = rootState;
    if (!app && !bill) return rootState;
    return {
      ...rootState,
      ...(app && {
        app: {
          ...app,
          exchangeRates: (app.exchangeRates ?? []).filter(
            (r) => r.currency !== app.mainCurrency,
          ),
        },
      }),
      ...(bill && {
        bill: {
          ...bill,
          itemMapping: (bill.itemMapping ?? []).map((mapping) => ({
            itemId: mapping.itemId,
            shares:
              mapping.shares ??
              (mapping.payerId ?? []).map((payerId) => ({
                payerId,
                weight: 1,
              })),
          })),
        },
      }),
    };
  },
};
