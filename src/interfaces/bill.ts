import { IBillItem } from './bill-item';
import { IPayer } from './payer';

export interface IBillState {
  title: string;
  items: IBillItem[];
  payers: IPayer[];
}