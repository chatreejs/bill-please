import {
  IBillItem,
  IBillItemMapping,
  IExpense,
  IExpenseChildren,
  IExpenseItem,
  IPayer,
} from '@interfaces';

/**
 * Split one mapped bill item equally between the payers assigned to it.
 * Returns undefined when the mapping points to an item that no longer exists
 * or has no payers.
 */
export const calculateExpenseItem = (
  mapping: IBillItemMapping,
  billItems: IBillItem[],
): IExpenseItem | undefined => {
  const billItem = billItems.find((item) => item.id === mapping.itemId);
  const payerCount = mapping.payerId.length;
  if (!billItem || payerCount === 0) return;

  const total =
    billItem.total ??
    billItem.price * billItem.quantity + billItem.service + billItem.vat;

  return {
    itemName: billItem.name,
    itemQuantity: billItem.quantity / payerCount,
    itemService: billItem.service / payerCount,
    itemVat: billItem.vat / payerCount,
    itemTotalPrice: total / payerCount,
  };
};

const collectExpenseItems = (
  payerId: string,
  billItems: IBillItem[],
  itemMapping: IBillItemMapping[],
): { total: number; items: IExpenseItem[] } => {
  const items = itemMapping
    .filter((mapping) => mapping.payerId.includes(payerId))
    .map((mapping) => calculateExpenseItem(mapping, billItems))
    .filter((item): item is IExpenseItem => item !== undefined);

  return {
    total: items.reduce((sum, item) => sum + item.itemTotalPrice, 0),
    items,
  };
};

/**
 * Compute what each payer owes. All amounts stay in the bill's main currency.
 * A payer's total includes the shares of their friends (sub-payers).
 */
export const calculateExpenses = (
  payers: IPayer[],
  billItems: IBillItem[],
  itemMapping: IBillItemMapping[],
): IExpense[] =>
  payers.map((payer) => {
    const own = collectExpenseItems(payer.id, billItems, itemMapping);

    const friend: IExpenseChildren[] = (payer.friend ?? []).map((f) => ({
      payerId: f.id,
      payerName: f.name,
      ...collectExpenseItems(f.id, billItems, itemMapping),
    }));

    return {
      payerId: payer.id,
      total: own.total + friend.reduce((sum, f) => sum + f.total, 0),
      items: own.items,
      friend,
    };
  });
