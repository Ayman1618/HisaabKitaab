import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TextHasher } from '../../common/utils/text-hasher.util';
import { ParserService } from '../parser/parser.service';
import { SmsPayload } from '../parser/interfaces';
import { TxType, Category } from '@prisma/client';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parserService: ParserService,
  ) {}

  async processSms(payload: SmsPayload) {
    const { userId, sender, body, receivedAt } = payload;
    
    // 1. Deduplication using Hash
    const hash = TextHasher.generateSmsHash(userId, body, sender, receivedAt);
    const existingSms = await this.prisma.rawSms.findUnique({ where: { hash } });
    if (existingSms) {
      this.logger.debug(`Duplicate SMS discarded: ${hash}`);
      return; 
    }

    // 2. Parse the SMS
    const parsedData = await this.parserService.parse(body);

    const isExpense = parsedData.finalResult.type === 'expense';
    const isIncome = parsedData.finalResult.type === 'income';

    // 3. Save Payload in Transaction bounds
    await this.prisma.$transaction(async (tx) => {
      // First save RawSms
      const rawSms = await tx.rawSms.create({
        data: {
          userId,
          body,
          sender,
          hash,
          receivedAt,
          processed: true,
          confidence: parsedData.finalResult.confidence,
        },
      });

      // Save Transaction if it's actionable
      if (parsedData.finalResult.is_transaction && parsedData.finalResult.amount) {
        let typeVal: TxType = TxType.UNKNOWN;
        if (isExpense) typeVal = TxType.EXPENSE;
        if (isIncome) typeVal = TxType.INCOME;

        await tx.transaction.create({
          data: {
            userId,
            rawSmsId: rawSms.id,
            amount: parsedData.finalResult.amount,
            type: typeVal,
            merchant: parsedData.finalResult.merchant || 'UNKNOWN',
            category: parsedData.finalResult.category as Category,
            confidence: parsedData.finalResult.confidence,
            isAiParsed: !!parsedData.aiResult, // True if AI result was used/existed
            transactionDate: receivedAt,
            manualCorrection: parsedData.requiresManualReview,
          },
        });
        
        this.logger.log(`Inserted transaction for User ${userId}. Amount: ${parsedData.finalResult.amount}`);
      }
    });
  }
}
