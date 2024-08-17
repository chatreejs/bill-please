import { IBillItem } from './bill-item';
import { IPayer } from './payer';

export interface IBill {
  title: string;
  items: IBillItem[];
  payers: IPayer[];
}
