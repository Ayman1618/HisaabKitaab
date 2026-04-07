import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Headers } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

class SyncSmsDto {
  messages: Array<{
    sender: string;
    body: string;
    timestamp: string | number; // Mobile sends this
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
    async syncMessages(
        @Body() dto: SyncSmsDto,
        @Headers('x-user-id') userId: string = 'demo-user-1'
    ) {
        // DEBUG: Explicit console.log for user visibility
        console.log(`\n[DEBUG] SMS SYNC REQUEST RECEIVED`);
        console.log(`[DEBUG] User ID: ${userId}`);
        console.log(`[DEBUG] Batch Size: ${dto.messages?.length || 0}`);
        
        if (!dto.messages || dto.messages.length === 0) {
            console.log(`[DEBUG] Empty batch received, skipping.`);
            return { status: 'empty', count: 0 };
        }

        try {
            // Offload payload array to BullMQ
            const jobs = dto.messages.map(msg => ({
                name: 'process-sms',
                data: {
                    userId,
                    sender: msg.sender,
                    body: msg.body,
                    receivedAt: msg.timestamp,
                },
            }));

            this.logger.log(`Queueing ${jobs.length} jobs...`);
            await this.smsQueue.addBulk(jobs);
            console.log(`[DEBUG] Successfully queued ${jobs.length} jobs to Redis.`);

            return {
                status: 'queued',
                count: jobs.length,
                userId
            };
        } catch (error) {
            console.error(`[DEBUG] FAILED to queue jobs to Redis:`, error.message);
            throw error;
        }
    }
}
