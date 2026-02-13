import { SkipThrottle as NestSkipThrottle, Throttle } from '@nestjs/throttler';

export const DefaultThrottle = () =>
    Throttle({
        default: {
            limit: 10,
            ttl: 60000,
        },
    });

export const AuthThrottle = () =>
    Throttle({
        auth: {
            limit: 5,
            ttl: 900000,
        },
    });

export const TransactionThrottle = () =>
    Throttle({
        transactions: {
            limit: 20,
            ttl: 60000,
        },
    });

export const StrictThrottle = () =>
    Throttle({
        strict: {
            limit: 3,
            ttl: 60000,
        },
    });

export const SkipThrottle = () => NestSkipThrottle();
