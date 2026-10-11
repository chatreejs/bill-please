/** A single line item read from a receipt image by the OCR / VLM service */
export interface IReceiptItem {
  name: string;
  quantity: number;
  /** Unit price, can be negative for discounts */
  price: number;
  servicePercentage?: number;
  vatPercentage?: number;
}

/** JSON payload returned by the receipt scanning service */
export interface IReceiptScanResult {
  items: IReceiptItem[];
}
