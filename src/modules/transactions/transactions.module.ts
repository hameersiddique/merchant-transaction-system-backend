import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';
import { TransactionsWorker } from './workers/transactions.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    RabbitMQModule,
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    TransactionsWorker,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule { }