import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import type { Cache } from 'cache-manager';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class RedisThrottlerStorageService implements ThrottlerStorage {
    private readonly prefix = 'throttler';

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext('RedisThrottlerStorage');
    }

    async increment(
        key: string,
        ttl: number,
        limit: number,
        blockDuration: number,
        throttlerName: string,
    ): Promise<{
        totalHits: number;
        timeToExpire: number;
        isBlocked: boolean;
        timeToBlockExpire: number;
    }> {
        const fullKey = `${this.prefix}:${throttlerName}:${key}`;
        const blockKey = `${fullKey}:blocked`;

        try {
            const blockedUntil = await this.cacheManager.get<number>(blockKey);
            const now = Date.now();

            if (blockedUntil && blockedUntil > now) {
                this.logger.warn(`eequest blocked- - blocked until ${new Date(blockedUntil)}`);

                return {
                    totalHits: limit + 1,
                    timeToExpire: now + ttl * 1000,
                    isBlocked: true,
                    timeToBlockExpire: blockedUntil,
                };
            }

            let hits = await this.cacheManager.get<number>(fullKey);

            if (!hits) {
                hits = 0;
            }

            hits++;

            await this.cacheManager.set(fullKey, hits, ttl * 1000);

            const timeToExpire = now + ttl * 1000;
            let isBlocked = false;
            let timeToBlockExpire = 0;

            if (hits > limit) {
                isBlocked = true;
                timeToBlockExpire = now + blockDuration * 1000;

                await this.cacheManager.set(blockKey, timeToBlockExpire, blockDuration * 1000);

                this.logger.warn(`rate limit exceeded: ${key} - ${hits}/${limit} hits, blocked for ${blockDuration}s`);
            } else {
                this.logger.debug(`rate limit check: ${key} - ${hits}/${limit} hits`);
            }

            return {
                totalHits: hits,
                timeToExpire,
                isBlocked,
                timeToBlockExpire,
            };
        } catch (error) {
            this.logger.error(
                `Failed to check rate limit for ${fullKey}`,
                error instanceof Error ? error.stack : String(error),
            );

            const now = Date.now();
            return {
                totalHits: 0,
                timeToExpire: now + ttl * 1000,
                isBlocked: false,
                timeToBlockExpire: 0,
            };
        }
    }

    async reset(key: string): Promise<void> {
        try {
            const pattern = `${this.prefix}:*:${key}*`;
            await this.cacheManager.del(pattern);
            this.logger.debug(`Reset rate limit: ${key}`);
        } catch (error) {
            this.logger.error(
                `Failed to reset rate limit for ${key}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }
}