import { describe, expect, it } from 'vitest';

import { IBillState } from '@interfaces';
import billReducer, { editPayer, removePayer, removePayers } from './BillSlice';

const state = (): IBillState => ({
  title: '',
  items: [],
  payers: [
    { id: 'a', name: 'Alice', friend: [{ id: 'd', name: 'Dave' }] },
    { id: 'b', name: 'Bob' },
    { id: 'c', name: 'Carol' },
  ],
  itemMapping: [
    {
      itemId: 'beer',
      shares: [
        { payerId: 'a', weight: 9 },
        { payerId: 'b', weight: 1 },
      ],
    },
    {
      itemId: 'pizza',
      shares: [
        { payerId: 'a', weight: 3 },
        { payerId: 'b', weight: 2 },
        { payerId: 'c', weight: 1 },
      ],
    },
  ],
});

const sharesOf = (s: IBillState, itemId: string) =>
  s.itemMapping.find((mapping) => mapping.itemId === itemId)?.shares;

describe('removing payers from mappings', () => {
  it('resets the weight to 1 when one payer is left on an item', () => {
    const next = billReducer(state(), removePayer('b'));
    expect(sharesOf(next, 'beer')).toEqual([{ payerId: 'a', weight: 1 }]);
  });

  it('keeps the weights when two or more payers are left', () => {
    const next = billReducer(state(), removePayer('b'));
    expect(sharesOf(next, 'pizza')).toEqual([
      { payerId: 'a', weight: 3 },
      { payerId: 'c', weight: 1 },
    ]);
  });

  it('resets the weight when several payers are removed at once', () => {
    const next = billReducer(state(), removePayers(['b', 'c']));
    expect(sharesOf(next, 'beer')).toEqual([{ payerId: 'a', weight: 1 }]);
    expect(sharesOf(next, 'pizza')).toEqual([{ payerId: 'a', weight: 1 }]);
  });

  it('resets the weight when a removed friend leaves one payer', () => {
    const start = state();
    start.itemMapping = [
      {
        itemId: 'beer',
        shares: [
          { payerId: 'd', weight: 4 },
          { payerId: 'b', weight: 5 },
        ],
      },
    ];
    const next = billReducer(start, editPayer({ id: 'a', name: 'Alice' }));
    expect(sharesOf(next, 'beer')).toEqual([{ payerId: 'b', weight: 1 }]);
  });

  it('leaves an item empty when its last payer is removed', () => {
    const start = state();
    start.itemMapping = [
      { itemId: 'beer', shares: [{ payerId: 'b', weight: 1 }] },
    ];
    const next = billReducer(start, removePayer('b'));
    expect(sharesOf(next, 'beer')).toEqual([]);
  });
});
