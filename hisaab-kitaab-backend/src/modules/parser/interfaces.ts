export interface ParseResult {
  amount: number | null;
  type: 'expense' | 'income' | 'unknown';
  merchant: string | null;
  category: string;
  confidence: number;
  is_transaction: boolean;
}

export interface SmsPayload {
  id: string;
  userId: string;
  sender: string;
  body: string;
  receivedAt: Date;
}
