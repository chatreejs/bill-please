import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createMigrate, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/es/storage';

import { appReducer, billReducer } from '@slices';
import { migrations } from './migrations';

const persistConfig = {
  key: 'bp-store',
  version: 3,
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
