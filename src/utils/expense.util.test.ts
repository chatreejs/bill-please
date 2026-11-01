import { describe, expect, it } from 'vitest';

import { IBillItem, IBillItemMapping, IPayer } from '@interfaces';
import { calculateService, calculateVat } from './bill.util';
import { calculateExpenseItem, calculateExpenses } from './expense.util';

const makeItem = (
  id: string,
  price: number,
  quantity = 1,
  servicePercentage = 0,
  vatPercentage = 0,
): IBillItem => {
  const service = calculateService(price, quantity, servicePercentage);
  const vat = calculateVat(price, quantity, servicePercentage, vatPercentage);
  return {
    id,
    name: `item-${id}`,
    price,
    quantity,
    service,
    servicePercentage,
    vat,
    vatPercentage,
    total: price * quantity + service + vat,
  };
};

describe('calculateService', () => {
  it('is a percentage of price × quantity', () => {
    expect(calculateService(100, 2, 10)).toBe(20);
  });

  it('is 0 when the percentage is 0', () => {
    expect(calculateService(100, 2, 0)).toBe(0);
  });
});

describe('calculateVat', () => {
  it('applies VAT on top of price and service', () => {
    // (100 + 10 service) × 7% = 7.7
    expect(calculateVat(100, 1, 10, 7)).toBeCloseTo(7.7);
  });

  it('applies VAT on price alone when there is no service', () => {
    expect(calculateVat(200, 1, 0, 7)).toBeCloseTo(14);
  });
});

describe('calculateExpenseItem', () => {
  it('splits quantity, service, VAT and total equally between payers', () => {
    const item = makeItem('a', 100, 2, 10, 7); // 200 + 20 + 15.4 = 235.4
    const result = calculateExpenseItem(
      { itemId: 'a', payerId: ['p1', 'p2'] },
      [item],
    );

    expect(result).toEqual({
      itemName: 'item-a',
      itemQuantity: 1,
      itemService: 10,
      itemVat: expect.closeTo(7.7) as number,
      itemTotalPrice: expect.closeTo(117.7) as number,
    });
  });

  it('returns undefined when the item no longer exists', () => {
    expect(
      calculateExpenseItem({ itemId: 'gone', payerId: ['p1'] }, []),
    ).toBeUndefined();
  });

  it('returns undefined when no payers are mapped', () => {
    expect(
      calculateExpenseItem({ itemId: 'a', payerId: [] }, [makeItem('a', 100)]),
    ).toBeUndefined();
  });

  it('derives the total when the item has none stored', () => {
    const item = { ...makeItem('a', 100, 1, 10, 7), total: undefined };
    const result = calculateExpenseItem({ itemId: 'a', payerId: ['p1'] }, [
      item,
    ]);
    expect(result?.itemTotalPrice).toBeCloseTo(117.7);
  });
});

describe('calculateExpenses', () => {
  const payers: IPayer[] = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Carol' },
  ];

  it('returns one expense per payer, in payer order', () => {
    const result = calculateExpenses(payers, [], []);
    expect(result.map((e) => e.payerId)).toEqual(['p1', 'p2', 'p3']);
    result.forEach((e) => {
      expect(e.total).toBe(0);
      expect(e.items).toEqual([]);
      expect(e.friend).toEqual([]);
    });
  });

  it('sums each payer’s share across items', () => {
    const items = [makeItem('pizza', 300), makeItem('beer', 90, 3)];
    const mapping: IBillItemMapping[] = [
      { itemId: 'pizza', payerId: ['p1', 'p2', 'p3'] },
      { itemId: 'beer', payerId: ['p1', 'p2'] },
    ];

    const [alice, bob, carol] = calculateExpenses(payers, items, mapping);

    expect(alice.total).toBe(100 + 135);
    expect(bob.total).toBe(100 + 135);
    expect(carol.total).toBe(100);
    expect(alice.items.map((i) => i.itemName)).toEqual([
      'item-pizza',
      'item-beer',
    ]);
    expect(alice.items[1].itemQuantity).toBe(1.5);
  });

  it('splits service and VAT proportionally', () => {
    const items = [makeItem('steak', 1000, 1, 10, 7)]; // 1000 + 100 + 77
    const mapping = [{ itemId: 'steak', payerId: ['p1', 'p2'] }];

    const [alice, bob] = calculateExpenses(payers, items, mapping);

    expect(alice.items[0].itemService).toBe(50);
    expect(alice.items[0].itemVat).toBeCloseTo(38.5);
    expect(alice.total).toBeCloseTo(588.5);
    expect(bob.total).toBeCloseTo(588.5);
  });

  it('adds up to the bill total when every item is mapped', () => {
    const items = [
      makeItem('a', 129, 1, 10, 7),
      makeItem('b', 59, 3, 10, 7),
      makeItem('c', 455, 2, 0, 7),
    ];
    const mapping = [
      { itemId: 'a', payerId: ['p1', 'p2', 'p3'] },
      { itemId: 'b', payerId: ['p2'] },
      { itemId: 'c', payerId: ['p1', 'p3'] },
    ];

    const billTotal = items.reduce((sum, i) => sum + i.total!, 0);
    const sum = calculateExpenses(payers, items, mapping).reduce(
      (acc, e) => acc + e.total,
      0,
    );

    expect(sum).toBeCloseTo(billTotal);
  });

  it('ignores mappings to deleted items', () => {
    const items = [makeItem('a', 100)];
    const mapping = [
      { itemId: 'a', payerId: ['p1'] },
      { itemId: 'deleted', payerId: ['p1'] },
    ];

    const [alice] = calculateExpenses(payers, items, mapping);

    expect(alice.items).toHaveLength(1);
    expect(alice.total).toBe(100);
  });

  it('rolls friends’ shares into the payer’s total', () => {
    const withFriends: IPayer[] = [
      {
        id: 'p1',
        name: 'Alice',
        friend: [
          { id: 'f1', name: 'Dave' },
          { id: 'f2', name: 'Eve' },
        ],
      },
      { id: 'p2', name: 'Bob' },
    ];
    const items = [makeItem('pizza', 400), makeItem('wine', 300)];
    const mapping = [
      { itemId: 'pizza', payerId: ['p1', 'f1', 'f2', 'p2'] },
      { itemId: 'wine', payerId: ['f1'] },
    ];

    const [alice, bob] = calculateExpenses(withFriends, items, mapping);

    expect(alice.items).toHaveLength(1);
    expect(alice.friend).toEqual([
      {
        payerId: 'f1',
        payerName: 'Dave',
        total: 100 + 300,
        items: [
          expect.objectContaining({ itemName: 'item-pizza' }),
          expect.objectContaining({ itemName: 'item-wine' }),
        ],
      },
      {
        payerId: 'f2',
        payerName: 'Eve',
        total: 100,
        items: [expect.objectContaining({ itemName: 'item-pizza' })],
      },
    ]);
    expect(alice.total).toBe(100 + 400 + 100);
    expect(bob.total).toBe(100);
  });
});
