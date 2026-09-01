import { IAppState, ICurrencyExchangeRate } from '@interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IAppState = {
  vatPercentage: 7,
  mainCurrency: 'THB',
  displayCurrency: 'THB',
  exchangeRates: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setVatPercentage(state, action: PayloadAction<number>) {
      state.vatPercentage = action.payload;
    },
    setMainCurrency(state, action: PayloadAction<string>) {
      state.mainCurrency = action.payload;
      state.displayCurrency = action.payload;
      state.exchangeRates = [];
    },
    setDisplayCurrency(state, action: PayloadAction<string>) {
      state.displayCurrency = action.payload;
    },
    addExchangeRate(state, action: PayloadAction<ICurrencyExchangeRate>) {
      const existing = state.exchangeRates.findIndex(
        (r) => r.currency === action.payload.currency,
      );
      if (existing >= 0) {
        state.exchangeRates[existing] = action.payload;
      } else {
        state.exchangeRates.push(action.payload);
      }
    },
    removeExchangeRate(state, action: PayloadAction<string>) {
      if (state.displayCurrency === action.payload) {
        state.displayCurrency = state.mainCurrency;
      }
      state.exchangeRates = state.exchangeRates.filter(
        (r) => r.currency !== action.payload,
      );
    },
  },
});

export default appSlice.reducer;
export const {
  setVatPercentage,
  setMainCurrency,
  setDisplayCurrency,
  addExchangeRate,
  removeExchangeRate,
} = appSlice.actions;
