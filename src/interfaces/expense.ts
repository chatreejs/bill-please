export interface IExpense {
  payerId: string;
  total: number;
  items: IExpenseItem[];
  friend?: IExpenseChildren[];
}

export interface IExpenseChildren {
  payerId: string;
  payerName: string;
  total: number;
  items: IExpenseItem[];
}

export interface IExpenseItem {
  itemName: string;
  itemQuantity: number;
  itemTotalPrice: number;
}
