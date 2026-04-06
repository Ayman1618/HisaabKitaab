import { Injectable, Logger } from '@nestjs/common';
import { ParseResult } from './interfaces';

@Injectable()
export class AiEngine {
  private readonly logger = new Logger(AiEngine.name);

  async extract(text: string): Promise<ParseResult> {
    this.logger.log(`Invoking AI fallback for SMS: "${text}"`);
    
    // MOCK OpenAI Call
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

    // Simple mock heuristic for demonstration purposes
    const lowerText = text.toLowerCase();
    const result: ParseResult = {
      amount: null,
      type: 'unknown',
      merchant: null,
      category: 'OTHER',
      confidence: 0.85,
      is_transaction: false,
    };

    if (lowerText.includes('zomato') || lowerText.includes('swiggy')) {
      result.merchant = lowerText.includes('zomato') ? 'Zomato' : 'Swiggy';
      result.type = 'expense';
      result.category = 'FOOD';
      result.amount = this.heuristicExtractAmount(lowerText);
      result.is_transaction = true;
    } else if (lowerText.includes('uber') || lowerText.includes('ola')) {
      result.merchant = lowerText.includes('uber') ? 'Uber' : 'Ola';
      result.type = 'expense';
      result.category = 'TRAVEL';
      result.amount = this.heuristicExtractAmount(lowerText);
      result.is_transaction = true;
    } else if (lowerText.includes('salary')) {
      result.type = 'income';
      result.merchant = 'Employer';
      result.category = 'OTHER';
      result.amount = this.heuristicExtractAmount(lowerText);
      result.is_transaction = true;
    } else {
      // Failed AI parsing
      result.confidence = 0.4; // Flags for manual review
    }

    return result;
  }

  private heuristicExtractAmount(text: string): number | null {
    const match = text.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }
}
