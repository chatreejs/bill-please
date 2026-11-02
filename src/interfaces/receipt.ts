/** A single line item read from a receipt image by the OCR / VLM service */
export interface IReceiptItem {
  name: string;
  quantity: number;
  /** Unit price, can be negative for discounts */
  price: number;
  servicePercentage?: number;
  vatPercentage?: number;
}

/** GET /api/receipts/status: how busy the receipt scanner's LLM queue is */
export interface IReceiptScannerStatus {
  status: 'ok';
  /** A new scan would be rejected right now, because the LLM queue is full */
  busy: boolean;
  queue?: {
    active: number;
    waiting: number;
    maxConcurrent: number;
    maxQueue: number;
  };
}

/** JSON payload returned by the receipt scanning service */
export interface IReceiptScanResult {
  items: IReceiptItem[];
}
