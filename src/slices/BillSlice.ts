import { IBillItem, IBillState, IPayer } from '@interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IBillState = {
  title: '',
  items: [],
  payers: [],
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    addItem(state, action: PayloadAction<IBillItem>) {
      const total = action.payload.price * action.payload.quantity;
      state.items.push({ ...action.payload, total });
    },
    editItem(state, action: PayloadAction<IBillItem>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      state.items[index] = action.payload;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    removeItems(state, action: PayloadAction<string[]>) {
      state.items = state.items.filter(
        (item) => !action.payload.includes(item.id),
      );
    },
    removeAllItems(state) {
      state.items = [];
    },
    addPayer(state, action: PayloadAction<IPayer>) {
      state.payers.push(action.payload);
    },
    removePayer(state, action: PayloadAction<string>) {
      state.payers = state.payers.filter(
        (payer) => payer.id !== action.payload,
      );
    },
  },
});

export default billSlice.reducer;
export const {
  setTitle,
  addItem,
  editItem,
  removeItem,
  removeItems,
  removeAllItems,
  addPayer,
  removePayer,
} = billSlice.actions;
