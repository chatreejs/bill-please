import { uuidv7 } from 'uuidv7';

import { IBillItem, IReceiptItem } from '@interfaces';

export const calculateService = (
  price: number,
  quantity: number,
  percentage: number,
): number => {
  if (!percentage) return 0;
  return price * quantity * (percentage / 100);
};

export const calculateVat = (
  price: number,
  quantity: number,
  servicePercentage: number,
  vatPercentage: number,
): number => {
  const service = calculateService(price, quantity, servicePercentage);
  return (price * quantity + service) * (vatPercentage / 100);
};

const toFiniteNumber = (value: unknown): number | undefined => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return typeof number === 'number' && Number.isFinite(number)
    ? number
    : undefined;
};

/**
 * Validate untrusted receipt JSON (e.g. from an AI service) and drop
 * entries that cannot be turned into a bill item.
 */
export const normalizeReceiptItems = (data: unknown): IReceiptItem[] => {
  const items = (data as { items?: unknown })?.items;
  if (!Array.isArray(items)) return [];

  return (items as Partial<Record<keyof IReceiptItem, unknown>>[]).reduce<
    IReceiptItem[]
  >((acc, raw) => {
    const name = typeof raw?.name === 'string' ? raw.name.trim() : '';
    const price = toFiniteNumber(raw?.price);
    if (!name || price === undefined) return acc;

    const quantity = toFiniteNumber(raw?.quantity);
    const servicePercentage = toFiniteNumber(raw?.servicePercentage);
    const vatPercentage = toFiniteNumber(raw?.vatPercentage);
    acc.push({
      name,
      price,
      quantity: quantity && quantity > 0 ? quantity : 1,
      servicePercentage:
        servicePercentage && servicePercentage > 0 ? servicePercentage : 0,
      vatPercentage: vatPercentage && vatPercentage > 0 ? vatPercentage : 0,
    });
    return acc;
  }, []);
};

export const receiptItemToBillItem = (item: IReceiptItem): IBillItem => {
  const servicePercentage = item.servicePercentage ?? 0;
  const vatPercentage = item.vatPercentage ?? 0;
  const service = calculateService(
    item.price,
    item.quantity,
    servicePercentage,
  );
  const vat = calculateVat(
    item.price,
    item.quantity,
    servicePercentage,
    vatPercentage,
  );
  return {
    id: uuidv7(),
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    service,
    servicePercentage,
    vat,
    vatPercentage,
    total: item.price * item.quantity + service + vat,
  };
};
