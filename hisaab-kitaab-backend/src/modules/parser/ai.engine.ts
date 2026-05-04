import { Injectable, Logger } from '@nestjs/common';
import { ParseResult } from './interfaces';

/**
 * AI Engine — currently a heuristic mock / fallback.
 *
 * PRODUCTION UPGRADE PATH:
 * Replace the mock body below with a real OpenAI / Gemini / Claude API call.
 *
 * Example system prompt for the real call:
 *   "You are a financial SMS parser for Indian bank messages. Extract: amount (number),
 *    type ('expense'|'income'|'unknown'), merchant (string|null), category
 *    ('FOOD'|'TRAVEL'|'SHOPPING'|'BILLS'|'ENTERTAINMENT'|'SALARY'|'OTHER'),
 *    is_transaction (boolean). Respond ONLY with valid JSON. No markdown fences."
 */
@Injectable()
export class AiEngine {
  private readonly logger = new Logger(AiEngine.name);

  async extract(text: string): Promise<ParseResult> {
    this.logger.debug(`[AiEngine] Fallback parsing: "${text.substring(0, 60)}..."`);

    // --- MOCK IMPLEMENTATION (replace with real API call for production) ---
    await new Promise(resolve => setTimeout(resolve, 200));

    const lower = text.toLowerCase();
    const result: ParseResult = {
      amount: this.extractAmount(text),
      type: 'unknown',
      merchant: null,
      category: 'OTHER',
      confidence: 0.65,
      is_transaction: false,
    };

    if (/debited|dr\.|spent|paid/i.test(text)) result.type = 'expense';
    else if (/credited|cr\.|salary|received/i.test(text)) result.type = 'income';

    if (lower.includes('zomato')) { result.merchant = 'Zomato'; result.category = 'FOOD'; }
    else if (lower.includes('swiggy')) { result.merchant = 'Swiggy'; result.category = 'FOOD'; }
    else if (lower.includes('uber')) { result.merchant = 'Uber'; result.category = 'TRAVEL'; }
    else if (lower.includes('amazon')) { result.merchant = 'Amazon'; result.category = 'SHOPPING'; }
    else if (lower.includes('salary')) { result.merchant = 'Salary'; result.category = 'SALARY'; result.type = 'income'; }
    else if (lower.includes('netflix')) { result.merchant = 'Netflix'; result.category = 'ENTERTAINMENT'; }

    result.is_transaction = result.amount !== null && result.amount > 0 && result.type !== 'unknown';
    // --- END MOCK ---

    return result;
  }

  private extractAmount(text: string): number | null {
    const matches = [...text.matchAll(/(?:rs\.?\s*|inr\.?\s*|₹\s*)([1-9][\d,]*(?:\.\d{1,2})?)/gi)];
    if (matches.length === 0) return null;
    const amounts = matches.map(m => parseFloat(m[1].replace(/,/g, '')));
    return Math.max(...amounts);
  }
}