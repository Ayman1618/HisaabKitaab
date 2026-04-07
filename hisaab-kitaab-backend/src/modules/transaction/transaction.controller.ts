import { Controller, Get, Headers, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/transactions')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getTransactions(@Headers('x-user-id') userId: string = 'demo-user-1') {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
      include: {
        rawSms: {
          select: {
            body: true,
            sender: true,
          }
        }
      }
    });
  }
}
