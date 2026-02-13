import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const getThrottlerConfig = (): ThrottlerModuleOptions => {
    return {
        throttlers: [
            {
                name: 'default',
                ttl: 60,
                limit: 10,
            },
            {
                name: 'auth',
                ttl: 90,
                limit: 150,
            },
            {
                name: 'transactions',
                ttl: 60,
                limit: 20,
            },
            {
                name: 'strict',
                ttl: 60,
                limit: 3,
            },
        ],
    };
};
