import { IBillItem, IBillItemMapping, IBillState, IPayer } from '@interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IBillState = {
  title: '',
  items: [],
  payers: [],
  itemMapping: [],
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    addItem(state, action: PayloadAction<IBillItem>) {
      const total =
        action.payload.price * action.payload.quantity +
        action.payload.service +
        action.payload.vat;
      state.items.push({ ...action.payload, total });
    },
    editItem(state, action: PayloadAction<IBillItem>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      const total =
        action.payload.price * action.payload.quantity +
        action.payload.service +
        action.payload.vat;
      state.items[index] = { ...action.payload, total };
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.itemMapping = state.itemMapping.filter(
        (mapping) => mapping.itemId !== action.payload,
      );
    },
    removeItems(state, action: PayloadAction<string[]>) {
      state.items = state.items.filter(
        (item) => !action.payload.includes(item.id),
      );
      state.itemMapping = state.itemMapping.filter(
        (mapping) => !action.payload.includes(mapping.itemId),
      );
    },
    removeAllItems(state) {
      state.items = [];
      state.itemMapping = [];
    },
    addPayer(state, action: PayloadAction<IPayer>) {
      state.payers.push(action.payload);
    },
    editPayer(state, action: PayloadAction<IPayer>) {
      // Store old friend id list
      const oldFriendIds =
        state.payers
          .find((payer) => payer.id === action.payload.id)
          ?.friend?.map((friend) => friend.id) ?? [];
      const index = state.payers.findIndex(
        (payer) => payer.id === action.payload.id,
      );
      state.payers[index] = action.payload;
      const newFriendIds =
        action.payload?.friend?.map((friend) => friend.id) ?? [];
      // Find removed friend id list
      const removedFriendIds = oldFriendIds?.filter(
        (id) => !newFriendIds.includes(id),
      );
      // Remove payer from itemMapping by removed friend id list
      if (removedFriendIds.length > 0) {
        state.itemMapping = state.itemMapping.map((mapping) => {
          const payerId = mapping.payerId.filter(
            (id) => !removedFriendIds.includes(id),
          );
          return { ...mapping, payerId };
        });
      }
    },
    removePayer(state, action: PayloadAction<string>) {
      // store payer id and friend id list
      const payerIds =
        state.payers
          .find((payer) => payer.id === action.payload)
          ?.friend?.map((friend) => friend.id) ?? [];
      payerIds.push(action.payload);

      state.payers = state.payers.filter(
        (payer) => payer.id !== action.payload,
      );
      state.itemMapping = state.itemMapping.map((mapping) => {
        const payerId = mapping.payerId.filter((id) => !payerIds.includes(id));
        return { ...mapping, payerId };
      });
    },
    removePayers(state, action: PayloadAction<string[]>) {
      // store payer id and friend id list
      const { payerIds, friendIds } = state.payers.reduce<{
        payerIds: string[];
        friendIds: string[];
      }>(
        (acc, payer) => {
          if (action.payload.includes(payer.id)) {
            acc.payerIds.push(payer.id);
            acc.friendIds.push(
              ...(payer?.friend?.map((friend) => friend.id) ?? []),
            );
          }
          return acc;
        },
        { payerIds: [], friendIds: [] },
      );
      const allIds: string[] = [...payerIds, ...friendIds];

      state.payers = state.payers.filter(
        (payer) => !action.payload.includes(payer.id),
      );
      state.itemMapping = state.itemMapping.map((mapping) => {
        const payerId = mapping.payerId.filter((id) => !allIds.includes(id));
        return { ...mapping, payerId };
      });
    },
    removeAllPayers(state) {
      state.payers = [];
      state.itemMapping = state.itemMapping.map((mapping) => ({
        ...mapping,
        payerId: [],
      }));
    },
    addBillItemMapping(state, action: PayloadAction<IBillItemMapping>) {
      state.itemMapping.push(action.payload);
    },
    editBillItemMapping(state, action: PayloadAction<IBillItemMapping>) {
      const index = state.itemMapping.findIndex(
        (mapping) => mapping.itemId === action.payload.itemId,
      );
      state.itemMapping[index] = action.payload;
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
  editPayer,
  removePayer,
  removePayers,
  removeAllPayers,
  addBillItemMapping,
  editBillItemMapping,
} = billSlice.actions;
