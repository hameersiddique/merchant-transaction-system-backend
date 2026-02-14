import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { getEnv } from 'src/common/utils/env.util';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { CreateTransactionRequestDto } from './dto/request/createTransaction.request.dto';
import { GetTransactionsResponseDto } from './dto/response/getTransactions.response.dto';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { TransactionCreatedEvent } from './events/transactionCreated.event';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly env: ReturnType<typeof getEnv>;

  constructor(
    private readonly transactionsRepository: TransactionsRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {
    this.env = getEnv(this.configService);
  }

  async create(
    createTransactionDto: CreateTransactionRequestDto,
    merchantId: string,
  ): Promise<Transaction> {
    if (!this.rabbitMQService.isConnected()) {
      this.logger.warn('rabbitMQ not connected');
    }

    const transaction = await this.transactionsRepository.create({
      ...createTransactionDto,
      merchantId,
      status: TransactionStatus.PENDING,
    });

    await this.invalidateMerchantCache(merchantId);

    this.publishTransactionCreatedEvent(transaction).catch((error) => {
      this.logger.error('failed to publish transaction event:', error);
    });

    this.logger.log(`transaction created: ${transaction.id}`);
    return transaction;
  }

  async findAll(
    merchantId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetTransactionsResponseDto> {

    this.logger.debug(`findAll called with merchantId: ${merchantId}, page: ${page}, limit: ${limit}`);
    this.logger.debug(`Types - page: ${typeof page}, limit: ${typeof limit}`);

    const cacheKey = this.buildCacheKey(merchantId, page, limit);
    this.logger.debug(`Cache key: ${cacheKey}`);

    const cachedData = await this.cacheManager.get<GetTransactionsResponseDto>(
      cacheKey,
    );

    if (cachedData) {
      this.logger.debug(`Returning cached data for key: ${cacheKey}`);
      return cachedData;
    }

    const skip = (page - 1) * limit;
    this.logger.debug(`Querying database with skip: ${skip}, take: ${limit}`);

    const [transactions, total] =
      await this.transactionsRepository.findByMerchant(merchantId, skip, limit);

    this.logger.debug(`Database returned ${transactions.length} transactions, total: ${total}`);

    const result: GetTransactionsResponseDto = {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, this.env.redisTtl);
    this.logger.debug(`Cached result with key: ${cacheKey}`);

    return result;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionsRepository.findById(id);
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.transactionsRepository.updateStatus(id, status);

    const transaction = await this.findById(id);
    if (transaction) {
      await this.invalidateMerchantCache(transaction.merchantId);
    }
  }

  private buildCacheKey(
    merchantId: string,
    page: number,
    limit: number,
  ): string {
    return `transactions:${merchantId}:${page}:${limit}`;
  }

  private async invalidateMerchantCache(merchantId: string): Promise<void> {
    await this.cacheManager.del(`transactions:${merchantId}:1:10`);
  }

  private async publishTransactionCreatedEvent(
    transaction: Transaction,
  ): Promise<void> {
    const event: TransactionCreatedEvent = new TransactionCreatedEvent({
      id: transaction.id,
      merchantId: transaction.merchantId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.createdAt,
    });

    await this.rabbitMQService.publishTransactionCreated(event);
    this.logger.log(`event published for transaction: ${transaction.id}`);
  }
}