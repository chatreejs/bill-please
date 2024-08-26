export interface IExpense {
  payerId: string;
  total: number;
  items: IExpenseItem[];
}

export interface IExpenseItem {
  itemName: string;
  itemQuantity: number;
  itemTotalPrice: number;
}
