import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length, Matches, Min } from 'class-validator';

export class CreateTransactionRequestDto {
    @ApiProperty({
        description: 'Transaction amount (must be greater than 0)',
        example: 100.50,
        minimum: 0.01,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0.01)
    amount!: number;

    @ApiProperty({
        description: 'Currency code (3 uppercase letters)',
        example: 'USD',
        pattern: '^[A-Z]{3}$',
        minLength: 3,
        maxLength: 3,
    })
    @IsNotEmpty()
    @IsString()
    @Length(3, 3)
    @Matches(/^[A-Z]{3}$/, { message: 'Currency must be 3 uppercase letters (e.g., USD, KWD)' })
    currency!: string;
}
