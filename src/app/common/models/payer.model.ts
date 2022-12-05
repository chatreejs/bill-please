export interface Payer {
  id: string;
  name: string;
  children: PayerChildren[];
}

export interface PayerChildren {
  id: string;
  name: string;
}
