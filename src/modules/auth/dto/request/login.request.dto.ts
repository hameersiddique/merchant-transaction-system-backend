import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
    @ApiProperty({
        description: 'Merchant email address',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'Merchant password',
        example: 'SecurePass123',
    })
    @IsNotEmpty()
    @IsString()
    password!: string;
}