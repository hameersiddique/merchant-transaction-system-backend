import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { rabbitMQConfig } from 'src/infrastructure/rabbitmq/rabbitmq.config';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CONFIG',
      useFactory: rabbitMQConfig,
      inject: [ConfigService],
    },
    RabbitMQService,
  ],
  exports: [RabbitMQService, 'RABBITMQ_CONFIG'],
})
export class RabbitMQModule { }