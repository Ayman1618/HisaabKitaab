import { Injectable } from '@nestjs/common';
import { ParseResult } from './interfaces';

@Injectable()
export class RegexEngine {
  // Common terms for non-transaction messages
  private readonly otpOrPromoRegex = /(otp|one time password|code is|pwd|verification|offer|discount|promo|free|claim now)/i;
  
  // Amount parsing: Optional currency symbols (Rs, INR, ₹, $, etc.), followed by numbers
  // Matches: Rs 500, INR 5,000.50, 1000 debited, ₹50.0
  private readonly amountRegex = /(?:rs\.?|inr|₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i;

  // Type parsing
  private readonly expenseRegex = /(debited|deducted|spent|paid|sent to|transfer to|dr)/i;
  private readonly incomeRegex = /(credited|added|received|deposited|cr)/i;

  // Basic merchant extraction pattern
  private readonly merchantRegex = /(?:info\s+|vpa\s+|to\s+|from\s+)([\w@.-]+)/i;

  isOtpOrPromo(text: string): boolean {
    return this.otpOrPromoRegex.test(text);
  }

  extract(text: string): ParseResult {
    const isPromo = this.isOtpOrPromo(text);
    if (isPromo) {
      return {
        amount: null,
        type: 'unknown',
        merchant: null,
        category: 'OTHER',
        confidence: 0.99, // We are very confident it is NOT a transaction
        is_transaction: false,
      };
    }

    let amount: number | null = null;
    let type: 'expense' | 'income' | 'unknown' = 'unknown';
    let merchant: string | null = null;
    let confidence = 0.0;
    
    // 1. Extract Amount
    const amountMatch = text.match(this.amountRegex);
    if (amountMatch && amountMatch[1]) {
      // Remove commas and convert to float
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      confidence += 0.4;
    }

    // 2. Extract Type
    if (this.expenseRegex.test(text)) {
      type = 'expense';
      confidence += 0.3;
    } else if (this.incomeRegex.test(text)) {
      type = 'income';
      confidence += 0.3;
    }

    // 3. Extract Merchant
    const merchantMatch = text.match(this.merchantRegex);
    if (merchantMatch && merchantMatch[1]) {
      merchant = merchantMatch[1].trim();
      confidence += 0.1;
    }

    // Normalize confidence
    confidence = Math.min(confidence, 0.95);

    const is_transaction = amount !== null && type !== 'unknown';

    return {
      amount,
      type,
      merchant,
      category: 'OTHER',
      confidence: is_transaction ? confidence : 0.2, // Low confidence if missing core pieces
      is_transaction,
    };
  }
}
