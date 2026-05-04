import { Injectable, Logger } from '@nestjs/common';
import { RegexEngine } from './regex.engine';
import { AiEngine } from './ai.engine';
import { ParseResult } from './interfaces';

const REGEX_CONFIDENCE_THRESHOLD = 0.70;
const MANUAL_REVIEW_THRESHOLD = 0.50;

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
    const regexResult = this.regexEngine.extract(smsText);
    let finalResult = regexResult;
    let aiResult: ParseResult | undefined;

    // High confidence regex — skip AI entirely
    if (regexResult.is_transaction && regexResult.confidence >= REGEX_CONFIDENCE_THRESHOLD) {
      return { finalResult, regexResult, requiresManualReview: false };
    }

    // Very low confidence — probably junk/OTP, skip AI
    if (!regexResult.is_transaction && regexResult.confidence < 0.20) {
      return { finalResult, regexResult, requiresManualReview: false };
    }

    // Ambiguous — invoke AI fallback
    this.logger.debug(
      `Regex confidence ${regexResult.confidence.toFixed(2)} below threshold. Invoking AI fallback.`,
    );

    try {
      aiResult = await this.aiEngine.extract(smsText);
      if (
        aiResult.confidence > regexResult.confidence + 0.05 ||
        (!regexResult.is_transaction && aiResult.is_transaction)
      ) {
        finalResult = {
          ...aiResult,
          amount: aiResult.amount ?? regexResult.amount,
          merchant: aiResult.merchant ?? regexResult.merchant,
        };
      }
    } catch (error) {
      this.logger.error('AI extraction failed, keeping regex result', (error as Error).message);
    }

    const requiresManualReview = finalResult.confidence < MANUAL_REVIEW_THRESHOLD && finalResult.is_transaction;

    return { finalResult, regexResult, aiResult, requiresManualReview };
  }
}