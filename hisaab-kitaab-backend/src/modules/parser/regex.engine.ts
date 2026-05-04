import { Injectable } from '@nestjs/common';
import { ParseResult } from './interfaces';

@Injectable()
export class RegexEngine {
  private readonly ignoreRegex =
    /\b(otp|one.?time.?password|verification code|password|otp is|code is|pwd|offer|discount|promo|free|claim now|congratulations|lucky|winner)\b/i;

  private readonly amountPattern =
    /(?:rs\.?\s*|inr\.?\s*|₹\s*)([1-9][\d,]*(?:\.\d{1,2})?)/gi;

  private readonly expensePattern =
    /\b(debited|debit|spent|paid|payment|sent\s+to|transferred?\s+to|purchase|dr\.?|used\s+for|charged|withdrawn)\b/i;
  private readonly incomePattern =
    /\b(credited|credit|received|added|deposited|cr\.?|salary|refund|cashback|reversal)\b/i;

  private readonly merchantPatterns: RegExp[] = [
    /\bat\s+([A-Za-z0-9 &.'_-]{2,30}?)(?:\s+on\b|\s+ref\b|\s+via\b|\.|\n|$)/i,
    /\bto\s+([A-Za-z0-9 &.'_-]{2,30}?)(?:\s+on\b|\s+ref\b|\s+via\b|\.|\n|$)/i,
    /\bfor\s+([A-Za-z0-9 &.'_-]{2,30}?)(?:\s+on\b|\s+ref\b|\s+order\b|\.|\n|$)/i,
    /info\s*:\s*([A-Za-z0-9 &.'_-]{2,40}?)(?:\.|,|\n|$)/i,
    /\bvpa\s+([A-Za-z0-9@._-]{3,40})/i,
  ];

  private readonly knownMerchants: [RegExp, string, string][] = [
    [/zomato/i, 'Zomato', 'FOOD'],
    [/swiggy/i, 'Swiggy', 'FOOD'],
    [/amazon\s*pay/i, 'Amazon Pay', 'SHOPPING'],
    [/amazon/i, 'Amazon', 'SHOPPING'],
    [/flipkart/i, 'Flipkart', 'SHOPPING'],
    [/uber\s*eats/i, 'Uber Eats', 'FOOD'],
    [/\buber\b/i, 'Uber', 'TRAVEL'],
    [/\bola\b/i, 'Ola', 'TRAVEL'],
    [/rapido/i, 'Rapido', 'TRAVEL'],
    [/netflix/i, 'Netflix', 'ENTERTAINMENT'],
    [/spotify/i, 'Spotify', 'ENTERTAINMENT'],
    [/hotstar|disney\+/i, 'Hotstar', 'ENTERTAINMENT'],
    [/paytm/i, 'Paytm', 'OTHER'],
    [/phonepe/i, 'PhonePe', 'OTHER'],
    [/gpay|google pay/i, 'Google Pay', 'OTHER'],
    [/irctc/i, 'IRCTC', 'TRAVEL'],
    [/makemytrip|mmt/i, 'MakeMyTrip', 'TRAVEL'],
    [/electricity|bescom|msedcl|tata power/i, 'Electricity Bill', 'BILLS'],
    [/recharge|jio|airtel|bsnl|\bvi\b/i, 'Mobile Recharge', 'BILLS'],
  ];

  extract(text: string): ParseResult {
    if (this.ignoreRegex.test(text)) {
      return this.createEmptyResult();
    }

    let amount: number | null = null;
    let type: 'expense' | 'income' | 'unknown' = 'unknown';
    let merchant: string | null = null;
    let category: string = 'OTHER';
    let confidence = 0.0;

    const allAmountMatches = [...text.matchAll(this.amountPattern)];
    if (allAmountMatches.length > 0) {
      const amounts = allAmountMatches.map(m => parseFloat(m[1].replace(/,/g, '')));
      amount = Math.max(...amounts);
      confidence += 0.45;
    }

    const isExpense = this.expensePattern.test(text);
    const isIncome = this.incomePattern.test(text);

    if (isExpense && !isIncome) {
      type = 'expense';
      confidence += 0.25;
    } else if (isIncome && !isExpense) {
      type = 'income';
      confidence += 0.25;
    } else if (isExpense && isIncome) {
      type = text.toLowerCase().includes('salary') ? 'income' : 'expense';
      confidence += 0.10;
    }

    for (const [pattern, name, cat] of this.knownMerchants) {
      if (pattern.test(text)) {
        merchant = name;
        category = cat;
        confidence += 0.20;
        break;
      }
    }

    if (!merchant && /\bsalary\b/i.test(text)) {
      merchant = 'Salary / Payroll';
      category = 'SALARY';
      type = 'income';
      confidence = Math.max(confidence, 0.80);
    }

    if (!merchant) {
      for (const pattern of this.merchantPatterns) {
        const match = text.match(pattern);
        if (match?.[1]) {
          const candidate = match[1].trim().replace(/\s+/g, ' ');
          if (!/^(your|bank|account|card|a\/c|ac\b)/i.test(candidate) && candidate.length >= 2) {
            merchant = candidate;
            confidence += 0.10;
            break;
          }
        }
      }
    }

    if (category === 'OTHER') {
      category = this.predictCategory(text, merchant);
    }

    const is_transaction = amount !== null && amount > 0 && type !== 'unknown';

    return {
      amount,
      type,
      merchant: merchant ?? (type === 'income' ? 'Income' : type === 'expense' ? 'Payment' : null),
      category,
      confidence: Math.min(confidence, 0.97),
      is_transaction,
    };
  }

  private predictCategory(text: string, merchant: string | null): string {
    const haystack = `${text} ${merchant ?? ''}`.toLowerCase();
    if (/salary|payroll|wages/i.test(haystack)) return 'SALARY';
    if (/food|restaurant|cafe|hotel|dine|eat|meal|pizza|burger|biryani/i.test(haystack)) return 'FOOD';
    if (/petrol|fuel|toll|cab|taxi|bus|train|flight|travel|metro|ola|uber|rapido/i.test(haystack)) return 'TRAVEL';
    if (/amazon|flipkart|myntra|shopping|clothes|shoes|apparel/i.test(haystack)) return 'SHOPPING';
    if (/electricity|water|gas|recharge|broadband|bill|subscription/i.test(haystack)) return 'BILLS';
    if (/netflix|movie|cinema|pvr|inox|hotstar|spotify|entertainment/i.test(haystack)) return 'ENTERTAINMENT';
    return 'OTHER';
  }

  private createEmptyResult(): ParseResult {
    return { amount: null, type: 'unknown', merchant: null, category: 'OTHER', confidence: 0, is_transaction: false };
  }
}