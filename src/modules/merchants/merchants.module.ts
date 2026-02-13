import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { MerchantsService } from './merchant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant])],
  exports: [TypeOrmModule],
  providers: [MerchantsService],
})
export class MerchantsModule { }
