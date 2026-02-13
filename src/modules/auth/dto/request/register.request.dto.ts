import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
    @ApiProperty({
        description: 'Merchant full name',
        example: 'John Doe',
    })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({
        description: 'Merchant email address',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({
        description:
            'Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number and one special character',
        example: 'Abc@1234',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
    @Matches(/(?=.*[@$!%*?&])/, {
        message: 'Password must contain at least one special character (@$!%*?&)',
    })
    password!: string;
}
