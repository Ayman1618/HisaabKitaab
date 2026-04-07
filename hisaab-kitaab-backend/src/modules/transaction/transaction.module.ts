import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [ParserModule],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
