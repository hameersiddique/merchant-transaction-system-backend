import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class TransactionsRepository {
    constructor(
        @InjectRepository(Transaction)
        private readonly repository: Repository<Transaction>,
    ) { }

    async create(data: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.repository.create(data);
        return this.repository.save(transaction);
    }

    async findById(id: string): Promise<Transaction | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByMerchant(
        merchantId: string,
        skip: number,
        take: number,
    ): Promise<[Transaction[], number]> {
        return this.repository.findAndCount({
            where: { merchantId },
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
    }

    async updateStatus(
        id: string,
        status: TransactionStatus,
    ): Promise<void> {
        await this.repository.update(id, { status });
    }

    async update(id: string, data: Partial<Transaction>): Promise<void> {
        await this.repository.update(id, data);
    }
}