import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisCacheModule } from './infrastructure/cache/cache.module';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { RateLimiterModule } from './infrastructure/rate-limiter/rate-limiter.module';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    LoggerModule,
    DatabaseModule,
    RedisCacheModule,
    RabbitMQModule,
    RateLimiterModule,
    AuthModule,
    MerchantsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }