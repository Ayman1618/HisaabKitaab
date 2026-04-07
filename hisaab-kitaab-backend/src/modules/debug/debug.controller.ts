import { Controller, Get, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/debug')
export class DebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('raw-sms')
  async getRawSms(
    @Headers('x-user-id') userId: string = 'demo-user-1',
    @Query('limit') limit: string = '50'
  ) {
    return this.prisma.rawSms.findMany({
      where: { userId },
      take: parseInt(limit),
      orderBy: { receivedAt: 'desc' },
      include: { transaction: true }
    });
  }

  @Get('stats')
  async getStats(@Headers('x-user-id') userId: string = 'demo-user-1') {
    const rawCount = await this.prisma.rawSms.count({ where: { userId } });
    const txCount = await this.prisma.transaction.count({ where: { userId } });
    
    return {
      userId,
      rawSmsCount: rawCount,
      transactionsCount: txCount,
    };
  }
}
