import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
    @ApiProperty({
        description: 'New JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token!: string;

    @ApiProperty({
        description: 'New JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refresh_token!: string;
}