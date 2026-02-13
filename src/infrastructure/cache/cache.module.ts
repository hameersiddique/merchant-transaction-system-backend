import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisConfig } from 'src/infrastructure/cache/redis.config';
import { LoggerService } from '../logging/logger.service';

@Module({
    imports: [CacheModule.registerAsync(redisConfig)],
    exports: [CacheModule],
    providers: [LoggerService]
})
export class RedisCacheModule { }