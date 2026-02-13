import { ApiProperty } from '@nestjs/swagger';
import { MerchantResponseDto } from './merchant.response.dto';

export class LoginResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token!: string;

    @ApiProperty({
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refresh_token!: string;

    @ApiProperty({
        type: MerchantResponseDto,
    })
    merchant!: MerchantResponseDto;
}