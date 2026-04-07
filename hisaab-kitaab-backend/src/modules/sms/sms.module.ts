import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SmsController } from './sms.controller';
import { SmsProcessor } from './sms.processor';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sms-processing-queue',
    }),
    TransactionModule,
  ],
  controllers: [SmsController],
  providers: [SmsProcessor],
})
export class SmsModule {}
