export interface TransactionCreatedEvent {
    id: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
}