import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './modules/sms/sms.module';
import { ParserModule } from './modules/parser/parser.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    PrismaModule,
    ParserModule,
    TransactionModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
