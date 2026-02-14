import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logging/logger.module';
import { LoggerService } from '../logging/logger.service';
import { getThrottlerConfig } from './rate-limiter.config';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Global()
@Module({
    imports: [
        RedisCacheModule,
        LoggerModule,
        ThrottlerModule.forRootAsync({
            imports: [RedisCacheModule, LoggerModule, ConfigModule],
            useFactory: async (
                cacheManager: Cache,
                logger: LoggerService,
                configService: ConfigService,
            ) => {
                const storage = new RedisThrottlerStorageService(cacheManager, logger);
                return {
                    ...getThrottlerConfig(configService),
                    storage,
                };
            },
            inject: [CACHE_MANAGER, LoggerService, ConfigService],
        }),
    ],
    providers: [RedisThrottlerStorageService],
    exports: [ThrottlerModule, RedisThrottlerStorageService],
})
export class RateLimiterModule { }