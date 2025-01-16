export interface IBillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  vat: number;
  vatPercentage: number;
  service: number;
  servicePercentage: number;
  total?: number;
}

export interface IBillItemForm {
  name: string;
  quantity?: number;
  price?: number;
  isVat?: boolean;
  vatPercentage?: number;
  isService?: boolean;
  servicePercentage?: number;
}
