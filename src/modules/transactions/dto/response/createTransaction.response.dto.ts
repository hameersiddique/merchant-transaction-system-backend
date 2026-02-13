import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionResponseDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id!: string;

    @ApiProperty({
        example: '987e6543-e21b-12d3-a456-426614174000',
    })
    merchantId!: string;

    @ApiProperty({
        example: 100.5,
    })
    amount!: number;

    @ApiProperty({
        example: 'USD',
    })
    currency!: string;

    @ApiProperty({
        example: 'PENDING',
    })
    status!: string;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt!: Date;
}
