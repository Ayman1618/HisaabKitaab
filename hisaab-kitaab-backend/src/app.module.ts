import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './modules/sms/sms.module';
import { ParserModule } from './modules/parser/parser.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DebugModule } from './modules/debug/debug.module';

@Module({
  imports: [
    PrismaModule,
    ParserModule,
    TransactionModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    SmsModule,
    DebugModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
