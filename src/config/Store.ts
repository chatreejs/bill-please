import { configureStore } from '@reduxjs/toolkit';
import { billReducer } from '@slices';

export const store = configureStore({
  reducer: {
    bill: billReducer,
  },
});

// Type definitions for the root state and dispatch function
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
