import {
  IBillItem,
  IBillItemMapping,
  IExpense,
  IExpenseChildren,
  IExpenseItem,
  IPayer,
} from '@interfaces';

/** The highest weight a payer can have on one item */
export const MAX_SHARE_WEIGHT = 99;

/** The ids of everyone who shares a mapped item */
export const getMappingPayerIds = (mapping: IBillItemMapping): string[] =>
  mapping.shares.map((share) => share.payerId);

/**
 * The part of an item one payer pays, from 0 to 1. It is their weight
 * divided by the sum of all weights, or 0 when the payer is not on the item.
 */
export const getShareRatio = (
  mapping: IBillItemMapping,
  payerId: string,
): number => {
  const share = mapping.shares.find((s) => s.payerId === payerId);
  const totalWeight = mapping.shares.reduce((sum, s) => sum + s.weight, 0);
  if (!share || totalWeight <= 0) return 0;
  return share.weight / totalWeight;
};

/** The item's full price, with service and VAT */
export const getBillItemTotal = (billItem: IBillItem): number =>
  billItem.total ??
  billItem.price * billItem.quantity + billItem.service + billItem.vat;

/**
 * One payer's part of a mapped bill item, split by the weights in the
 * mapping. Returns undefined when the mapping points to an item that no
 * longer exists, or the payer is not on it.
 */
export const calculateExpenseItem = (
  mapping: IBillItemMapping,
  billItems: IBillItem[],
  payerId: string,
): IExpenseItem | undefined => {
  const billItem = billItems.find((item) => item.id === mapping.itemId);
  const ratio = getShareRatio(mapping, payerId);
  if (!billItem || ratio === 0) return;

  return {
    itemName: billItem.name,
    itemQuantity: billItem.quantity * ratio,
    itemService: billItem.service * ratio,
    itemVat: billItem.vat * ratio,
    itemTotalPrice: getBillItemTotal(billItem) * ratio,
  };
};

const collectExpenseItems = (
  payerId: string,
  billItems: IBillItem[],
  itemMapping: IBillItemMapping[],
): { total: number; items: IExpenseItem[] } => {
  const items = itemMapping
    .map((mapping) => calculateExpenseItem(mapping, billItems, payerId))
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
