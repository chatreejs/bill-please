/** One person's part of a mapped item. A weight only means something next to the other weights on the item. */
export interface IBillItemShare {
  /** The id of a payer, or of one of a payer's friends */
  payerId: string;
  /** A whole number, 1 or more. A payer with weight 2 pays twice as much as a payer with weight 1. */
  weight: number;
}

export interface IBillItemMapping {
  itemId: string;
  shares: IBillItemShare[];
}
