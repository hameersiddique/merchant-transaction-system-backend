import { ConfigService } from '@nestjs/config';
import type { RabbitMQConfig } from 'src/common/types';
import { getEnv } from 'src/common/utils/env.util';

export const rabbitMQConfig = (configService: ConfigService): RabbitMQConfig => {
    const env = getEnv(configService);

    return {
        url: env.rabbitUrl,
        exchange: env.rabbitExchange,
        queue: env.rabbitQueue,
        routingKey: env.rabbitRoutingKey,
    };
};
