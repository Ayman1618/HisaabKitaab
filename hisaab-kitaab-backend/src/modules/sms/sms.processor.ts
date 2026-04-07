import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';

@Processor('sms-processing-queue')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, sender, body, receivedAt } = job.data;
    
    this.logger.debug(`Processing job ${job.id} for user ${userId}`);

    await this.transactionService.processSms({
      id: job.id!,
      userId,
      sender,
      body,
      receivedAt: new Date(receivedAt),
    });
  }
}
