export interface IBillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  vatPercentage: number;
  vat: number;
  total?: number;
}

export interface IBillItemForm {
  name: string;
  quantity?: number;
  price?: number;
  isVat?: boolean;
  vatPercentage?: number;
}
