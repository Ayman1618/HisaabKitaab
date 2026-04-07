import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

class SyncSmsDto {
  userId: string;
  messages: Array<{
    id: string; // Android Message ID
    sender: string;
    body: string;
    receivedAt: string; // ISO String
  }>;
}

@Controller('api/v1/sms')
export class SmsController {
  private readonly logger = new Logger(SmsController.name);

  constructor(
    @InjectQueue('sms-processing-queue') private readonly smsQueue: Queue,
  ) {}

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async syncMessages(@Body() dto: SyncSmsDto) {
    this.logger.log(`Received SMS batch of size ${dto.messages.length} from user ${dto.userId}`);

    // Offload payload array to BullMQ
    const jobs = dto.messages.map(msg => ({
      name: 'process-sms',
      data: {
        userId: dto.userId,
        id: msg.id,
        sender: msg.sender,
        body: msg.body,
        receivedAt: msg.receivedAt,
      },
    }));

    await this.smsQueue.addBulk(jobs);

    return {
      status: 'queued',
      count: jobs.length,
    };
  }
}
