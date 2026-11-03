/** A single line item read from a receipt image by the OCR / VLM service */
export interface IReceiptItem {
  name: string;
  quantity: number;
  /** Unit price, can be negative for discounts */
  price: number;
  servicePercentage?: number;
  vatPercentage?: number;
}

/**
 * How busy the receipt scanner's LLM queue is. GET /api/receipts/status
 * answers it as JSON, or as each `status` event of its Server-Sent Events stream
 */
export interface IReceiptScannerStatus {
  status: 'ok';
  /** A new scan would be rejected right now, because the LLM queue is full */
  busy: boolean;
  /**
   * False while the server's OCR or LLM is down, so a scan can't work.
   * Missing from older servers, which counts as available
   */
  available?: boolean;
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

/**
 * One step of a scan. POST /api/receipts/scan streams ocr, queue and llm as
 * Server-Sent Events, and the web adds upload while it sends the photo.
 */
export interface IReceiptScanProgress {
  stage: 'upload' | 'ocr' | 'queue' | 'llm';
  /** Share of the photo sent so far, 0 to 100, while stage is upload */
  uploadPercent?: number;
  /** Place in the LLM queue while stage is queue. 1 is next */
  position?: number;
  /** Items the AI has read so far while stage is llm */
  items?: number;
}
