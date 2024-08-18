export interface IBillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface IBillItemForm {
  name: string;
  quantity: number;
  price: number;
}
