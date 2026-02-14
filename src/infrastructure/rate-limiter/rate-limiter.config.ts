import { ConfigService } from "@nestjs/config";
import { ThrottlerModuleOptions } from "@nestjs/throttler";

export const getThrottlerConfig = (
    configService: ConfigService,
): ThrottlerModuleOptions => ({
    throttlers: [
        {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_DEFAULT_TTL', 60),
            limit: configService.get<number>('THROTTLE_DEFAULT_LIMIT', 100),
        },
        {
            name: 'auth',
            ttl: configService.get<number>('THROTTLE_AUTH_TTL', 60),
            limit: configService.get<number>('THROTTLE_AUTH_LIMIT', 20),
        },
        {
            name: 'transactions',
            ttl: configService.get<number>('THROTTLE_TX_TTL', 60),
            limit: configService.get<number>('THROTTLE_TX_LIMIT', 50),
        },
        {
            name: 'strict',
            ttl: configService.get<number>('THROTTLE_STRICT_TTL', 60),
            limit: configService.get<number>('THROTTLE_STRICT_LIMIT', 10),
        },
    ],
});