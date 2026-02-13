import { ConfigService } from '@nestjs/config';
import { getEnv } from 'src/common/utils/env.util';

export interface RabbitMQConfig {
    url: string;
    exchange: string;
    queue: string;
    routingKey: string;
}

export const rabbitMQConfig = (configService: ConfigService): RabbitMQConfig => {
    const env = getEnv(configService);

    return {
        url: env.rabbitUrl,
        exchange: env.rabbitExchange,
        queue: env.rabbitQueue,
        routingKey: env.rabbitRoutingKey,
    };
};
