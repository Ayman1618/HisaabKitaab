import { Controller, Get, Headers, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/transactions')
export class TransactionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getTransactions(
    @Headers('x-user-id') userId: string = 'demo-user-1',
    @Query('limit') limit = '50',
    @Query('category') category?: string,
    @Query('type') type?: string,
  ) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        ...(category ? { category: category as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { transactionDate: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 200),
      select: {
        id: true,
        amount: true,
        type: true,
        currency: true,
        merchant: true,
        category: true,
        confidence: true,
        isAiParsed: true,
        manualCorrection: true,
        transactionDate: true,
        createdAt: true,
        rawSms: {
          select: { body: true, sender: true },
        },
      },
    });
  }

  @Get('summary')
  async getSummary(@Headers('x-user-id') userId: string = 'demo-user-1') {
    const [expenses, incomes, byCategory] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.groupBy({
        by: ['category'],
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    return {
      totalExpense: expenses._sum.amount ?? 0,
      totalIncome: incomes._sum.amount ?? 0,
      expenseCount: expenses._count,
      incomeCount: incomes._count,
      byCategory: byCategory.map(c => ({
        category: c.category,
        total: c._sum.amount ?? 0,
        count: c._count,
      })),
    };
  }
}