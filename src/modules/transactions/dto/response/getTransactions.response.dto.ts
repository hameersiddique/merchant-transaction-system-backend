import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './paginationMeta.response.dto';
import { CreateTransactionResponseDto } from './createTransaction.response.dto';

export class GetTransactionsResponseDto {
    @ApiProperty({ type: [CreateTransactionResponseDto] })
    data!: CreateTransactionResponseDto[];

    @ApiProperty({ type: PaginationMetaDto })
    meta!: PaginationMetaDto;
}
