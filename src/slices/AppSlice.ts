import { IAppState } from '@interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IAppState = {
  vatPercentage: 7,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setVatPercentage(state, action: PayloadAction<number>) {
      state.vatPercentage = action.payload;
    },
  },
});

export default appSlice.reducer;
export const { setVatPercentage } = appSlice.actions;
