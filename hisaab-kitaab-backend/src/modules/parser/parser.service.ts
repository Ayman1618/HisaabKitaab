import { Injectable, Logger } from '@nestjs/common';
import { RegexEngine } from './regex.engine';
import { AiEngine } from './ai.engine';
import { ParseResult } from './interfaces';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(
    private readonly regexEngine: RegexEngine,
    private readonly aiEngine: AiEngine,
  ) {}

  async parse(smsText: string): Promise<{
    finalResult: ParseResult;
    regexResult: ParseResult;
    aiResult?: ParseResult;
    requiresManualReview: boolean;
  }> {
    this.logger.debug(`Parsing SMS: ${smsText}`);

    // 1. Rule-based Extraction (Regex)
    const regexResult = this.regexEngine.extract(smsText);
    let finalResult = regexResult;
    let aiResult: ParseResult | undefined = undefined;

    // 2. Logic Check & Confidence Threshold (0.7)
    if (!regexResult.is_transaction && regexResult.confidence >= 0.90) {
      return { finalResult, regexResult, requiresManualReview: false };
    }

    // AI Fallback
    if (regexResult.confidence < 0.7 || !regexResult.is_transaction) {
      this.logger.debug(`Regex confidence ${regexResult.confidence} < 0.7. Falling back to AI.`);
      
      try {
        aiResult = await this.aiEngine.extract(smsText);
        
        if (aiResult.confidence > regexResult.confidence) {
          finalResult = aiResult;
        }
      } catch (error) {
        this.logger.error(`AI extraction failed`, error);
      }
    }

    // 3. Manual Review check (If final confidence < 0.5)
    const requiresManualReview = finalResult.confidence < 0.5;

    return { finalResult, regexResult, aiResult, requiresManualReview };
  }
}
