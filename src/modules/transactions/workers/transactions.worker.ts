import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../../infrastructure/rabbitmq/rabbitmq.service';
import { TransactionStatus } from '../entities/transaction.entity';
import { TransactionCreatedEvent } from '../events/transactionCreated.event';
import { TransactionsRepository } from '../transactions.repository';

@Injectable()
export class TransactionsWorker implements OnModuleInit {
    private readonly logger = new Logger(TransactionsWorker.name);

    constructor(
        private readonly transactionsRepository: TransactionsRepository,
        private readonly rabbitMQService: RabbitMQService,
    ) { }

    async onModuleInit() {
        await this.startConsumer();
        this.logger.log('bg worker started');
    }

    private async startConsumer(): Promise<void> {
        await this.rabbitMQService.consume(async (message: TransactionCreatedEvent) => {
            await this.processTransaction(message);
        });
    }

    private async processTransaction(event: TransactionCreatedEvent): Promise<void> {
        this.logger.log(`processing transaction ${event.id}`);

        try {
            // simulate processing delay (5 seconds)
            await this.simulateProcessing(5000);

            await this.transactionsRepository.updateStatus(
                event.id,
                TransactionStatus.SUCCESS,
            );

            this.logger.log(`transaction ${event.id} completed successfully`);
        } catch (error) {
            this.logger.error(`failed to process transaction ${event.id}:`, error);

            await this.transactionsRepository.updateStatus(
                event.id,
                TransactionStatus.FAILED,
            );
        }
    }

    private async simulateProcessing(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}