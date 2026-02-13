import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
    @ApiProperty({
        example: 'b3f7a6e2-1234-4567-8910-abcdef123456',
    })
    id!: string;

    @ApiProperty({
        example: 'John Doe',
    })
    name!: string;

    @ApiProperty({
        example: 'john.doe@example.com',
    })
    email!: string;

    @ApiProperty({
        example: '2026-02-13T10:20:30.000Z',
    })
    createdAt!: Date;
}
