import { IAppState } from '@interfaces';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  createMigrate,
  MigrationManifest,
  PersistedState,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/es/storage';

import { appReducer, billReducer } from '@slices';

type PersistedRootState = PersistedState & {
  app?: Partial<IAppState>;
};

// Users who upgraded from before v0.9.0 have a persisted `app` slice without
// mainCurrency/displayCurrency. autoMergeLevel1 (the default reconciler)
// replaces the whole slice, so those fields rehydrate as undefined. Backfill
// them with the 'THB' default.
const migrations: MigrationManifest = {
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
};

const persistConfig = {
  key: 'bp-store',
  version: 1,
  storage,
  migrate: createMigrate(migrations),
};

const rootReducer = combineReducers({
  bill: billReducer,
  app: appReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Type definitions for the root state and dispatch function
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
