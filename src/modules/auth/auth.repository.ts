import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';

@Injectable()
export class AuthRepository {
    constructor(
        @InjectRepository(Merchant)
        private readonly repository: Repository<Merchant>,
    ) {}

    async findByEmail(email: string): Promise<Merchant | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<Merchant | null> {
        return this.repository.findOne({ where: { id } });
    }

    async create(merchantData: Partial<Merchant>): Promise<Merchant> {
        const merchant = this.repository.create(merchantData);
        return this.repository.save(merchant);
    }

    async emailExists(email: string): Promise<boolean> {
        const count = await this.repository.count({ where: { email } });
        return count > 0;
    }

    async updateRefreshToken(
        merchantId: string,
        refreshToken: string | null,
    ): Promise<void> {
        await this.repository.update(merchantId, { refreshToken });
    }
}