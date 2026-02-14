import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import type { ConfirmChannel, Options } from 'amqplib';
import type { RabbitMQConfig } from 'src/common/types';
import { TransactionCreatedEvent } from 'src/modules/transactions/events/transactionCreated.event';

interface MessageHandler {
  (message: any): Promise<void>;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: amqp.AmqpConnectionManager;
  private channelWrapper!: amqp.ChannelWrapper;
  private isReady = false;

  constructor(
    @Inject('RABBITMQ_CONFIG')
    private readonly config: RabbitMQConfig,
  ) { }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = amqp.connect([this.config.url]);

      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          await channel.assertExchange(this.config.exchange, 'topic', {
            durable: true,
          });
          await channel.assertQueue(this.config.queue, { durable: true });
          await channel.bindQueue(
            this.config.queue,
            this.config.exchange,
            this.config.routingKey,
          );
        },
      });

      this.connection.on('connect', () => {
        this.isReady = true;
        this.logger.log('connected rabbitMQ');
      });

      this.connection.on('disconnect', (err) => {
        this.isReady = false;
        this.logger.warn('disconnected rabbitMQ', err);
      });

      this.connection.on('connectFailed', (err) => {
        this.isReady = false;
        this.logger.error('failed to connect rabbitMQ', err);
      });

      await this.waitForConnection();
    } catch (error) {
      this.logger.error('failed to initialize rabbitMQ:', error);
      throw error;
    }
  }

  private async waitForConnection(timeout = 10000): Promise<void> {
    const startTime = Date.now();

    while (!this.isReady) {
      if (Date.now() - startTime > timeout) {
        throw new Error('rabbitMQ connection timeout');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async publish(routingKey: string, message: unknown): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('rabbitMQ not ready, skipping message publish');
      return;
    }

    try {
      const options: Options.Publish = {
        persistent: true,
        contentType: 'application/json',
      };

      await this.channelWrapper.publish(
        this.config.exchange,
        routingKey,
        message,
        options,
      );

      this.logger.log(`published message to ${routingKey}`);
    } catch (error) {
      this.logger.error('failed to publish message:', error);
      throw error;
    }
  }

  async publishTransactionCreated(event: TransactionCreatedEvent): Promise<void> {
    await this.publish(this.config.routingKey, event);
  }

  async consume(handler: MessageHandler): Promise<void> {
    await this.waitForConnection();

    await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
      await channel.consume(
        this.config.queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);
            channel.ack(msg);
            this.logger.debug(`message processed successfully`);
          } catch (error) {
            this.logger.error('error processing message:', error);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log('consumer registered and ready');
    });
  }

  private async disconnect() {
    try {
      this.isReady = false;
      await this.channelWrapper?.close();
      await this.connection?.close();
      this.logger.log('disconnected from rabbitMQ');
    } catch (error) {
      this.logger.error('error disconnecting from rabbitMQ:', error);
    }
  }

  isConnected(): boolean {
    return this.isReady && (this.connection?.isConnected() ?? false);
  }
}