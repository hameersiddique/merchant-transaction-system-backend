import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { getEnv } from '../../common/utils/env.util';
import { LoggerService } from '../logging/logger.service';

export const redisConfig: CacheModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService, LoggerService],
    isGlobal: true,
    useFactory: async (
        configService: ConfigService,
        logger: LoggerService,
    ) => {
        const env = getEnv(configService);

        try {
            logger.log('connecting redis');

            const store = await redisStore({
                socket: {
                    host: env.redisHost,
                    port: env.redisPort,
                },
                password: env.redisPassword || undefined,
            });

            logger.log('connected redis');

            return {
                store,
                ttl: env.redisTtl,
            };
        } catch {
            logger.error('failed to connect to redis');
            logger.warn('continuing without redis');
            return {};
        }
    },
};