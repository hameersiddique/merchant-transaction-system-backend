export class TransactionCreatedEvent {
    id!: string;
    merchantId!: string;
    amount!: number;
    currency!: string;
    status!: string;
    createdAt!: Date;

    constructor(data: TransactionCreatedEvent) {
        Object.assign(this, data);
    }
}