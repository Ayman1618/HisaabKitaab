import { Injectable } from '@nestjs/common';
import { ParseResult } from './interfaces';

@Injectable()
export class RegexEngine {
  // 1. Identify patterns to IGNORE (OTPs, Promos, Account Numbers)
  private readonly ignoreRegex = /(otp|one time password|code is|pwd|verification|offer|discount|promo|free|claim now)/i;
  private readonly accountPattern = /(?:a\/c|ac\/no|acct|account|xx)\s*(\d{3,})/i;

  // 2. Comprehensive Amount Regex (looks for currency symbols followed by numbers)
  private readonly amountPattern = /(?:rs\.?|inr|₹|inr\.)\s*([\d,]+(?:\.\d{1,2})?)/i;

  // 3. Transaction Types
  private readonly expensePattern = /(debited|spent|paid|payment|sent to|transfer to|dr|used for)/i;
  private readonly incomePattern = /(credited|received|added|deposited|received from|cr|salary)/i;

  // 4. Merchant patterns
  private readonly merchantPatterns = [
    /(?:at|to|on)\s+([^.\n]{2,25})(?:\s+on|\s+ref|\s+using|$)/i, 
    /(?:info\s+|vpa\s+|ref:?\s*)([^.\n]{2,25})/i,
    /for\s+([^.\n]{2,25})(?:\s+on|\s+ref|$)/i
  ];

  extract(text: string): ParseResult {
    const lowerText = text.toLowerCase();
    
    // Check if it's junk
    if (this.ignoreRegex.test(text)) {
      return this.createEmptyResult();
    }

    let amount: number | null = null;
    let type: 'expense' | 'income' | 'unknown' = 'unknown';
    let merchant: string | null = null;
    let confidence = 0.0;

    // 1. Extract AMOUNT (picking the largest number linked to currency)
    const amountMatches = [...text.matchAll(new RegExp(this.amountPattern, 'gi'))];
    if (amountMatches.length > 0) {
      // Convert all matches to numbers and pick the largest one (usually the amount)
      const amounts = amountMatches.map(m => parseFloat(m[1].replace(/,/g, '')));
      amount = Math.max(...amounts);
      confidence += 0.5;
    }

    // 2. Extract TYPE
    if (this.expensePattern.test(text)) {
      type = 'expense';
      confidence += 0.2;
    } else if (this.incomePattern.test(text)) {
      type = 'income';
      if (lowerText.includes('salary')) {
        merchant = 'Salary / Payroll';
        type = 'income';
      }
      confidence += 0.2;
    }

    // 3. Extract MERCHANT (if not already set by Salary)
    if (!merchant) {
      // Priority 1: Specifically check for big brands
      if (lowerText.includes('amazon')) merchant = 'Amazon';
      else if (lowerText.includes('zomato')) merchant = 'Zomato';
      else if (lowerText.includes('swiggy')) merchant = 'Swiggy';
      else if (lowerText.includes('uber')) merchant = 'Uber';
      else if (lowerText.includes('ola')) merchant = 'Ola';
      else {
        // Priority 2: Use patterns (at, to, ref, etc.)
        for (const pattern of this.merchantPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            merchant = match[1].trim();
            break;
          }
        }
      }
    }

    if (merchant) confidence += 0.2;

    // 4. Final Cleanup & Category
    const is_transaction = amount !== null && type !== 'unknown' && amount > 0;
    
    return {
      amount,
      type,
      merchant: merchant || (type === 'income' ? 'Income Received' : 'Expense'),
      category: this.predictCategory(text, merchant),
      confidence: Math.min(confidence, 0.98),
      is_transaction,
    };
  }

  private predictCategory(text: string, merchant: string | null): any {
    const combined = (text + ' ' + (merchant || '')).toLowerCase();
    
    if (combined.includes('salary') || combined.includes('payroll')) return 'SALARY';
    if (combined.includes('zomato') || combined.includes('swiggy') || combined.includes('food') || combined.includes('restaurant')) return 'FOOD';
    if (combined.includes('uber') || combined.includes('ola') || combined.includes('travel') || combined.includes('petrol')) return 'TRAVEL';
    if (combined.includes('amazon') || combined.includes('flipkart') || combined.includes('shopping')) return 'SHOPPING';
    if (combined.includes('bill') || combined.includes('recharge') || combined.includes('electricity')) return 'BILLS';
    if (combined.includes('netflix') || combined.includes('movie') || combined.includes('entertainment')) return 'ENTERTAINMENT';
    
    return 'OTHER';
  }

  private createEmptyResult(): ParseResult {
    return {
      amount: null,
      type: 'unknown',
      merchant: null,
      category: 'OTHER',
      confidence: 0,
      is_transaction: false,
    };
  }
}
