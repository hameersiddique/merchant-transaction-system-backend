import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
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
            imports: [RedisCacheModule, LoggerModule],
            useFactory: async (
                cacheManager: Cache,
                logger: LoggerService,
            ) => {
                const storage = new RedisThrottlerStorageService(cacheManager, logger);
                return {
                    ...getThrottlerConfig(),
                    storage,
                };
            },
            inject: [CACHE_MANAGER, LoggerService],
        }),
    ],
    providers: [RedisThrottlerStorageService],
    exports: [ThrottlerModule, RedisThrottlerStorageService],
})
export class RateLimiterModule { }