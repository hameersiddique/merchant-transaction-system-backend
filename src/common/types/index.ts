export interface TransactionCreatedEvent {
    id: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
}

export interface RabbitMQConfig {
    url: string;
    exchange: string;
    queue: string;
    routingKey: string;
}