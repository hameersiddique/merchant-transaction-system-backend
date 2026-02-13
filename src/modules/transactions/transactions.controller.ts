import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthThrottle } from 'src/infrastructure/rate-limiter/decorators/throttle.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionRequestDto } from './dto/request/createTransaction.request.dto';
import { GetPaginatedTransactionsRequestDto } from './dto/request/getTransactions.request.dto';
import { CreateTransactionResponseDto } from './dto/response/createTransaction.response.dto';
import { GetTransactionsResponseDto } from './dto/response/getTransactions.response.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) { }

  @Post()
  @AuthThrottle()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiCreatedResponse({
    description: 'Transaction successfully created',
    type: CreateTransactionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() CreateTransactionRequestDto: CreateTransactionRequestDto,
    @Request() req,
  ): Promise<CreateTransactionResponseDto> {
    return this.transactionsService.create(
      CreateTransactionRequestDto,
      req.user.userId,
    );
  }

  @Get()
  @AuthThrottle()
  @ApiOperation({
    summary: 'Get paginated list of merchant transactions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated transactions list',
    type: GetTransactionsResponseDto,
  })
  async findAll(
    @Query() query: GetPaginatedTransactionsRequestDto,
    @Request() req,
  ): Promise<GetTransactionsResponseDto> {
    const pageNum = parseInt(query.page?.toString() || '1', 10);
    const limitNum = parseInt(query.limit?.toString() || '10', 10);
    console.log('pageNum', pageNum);
    console.log('limitNum', limitNum);

    return this.transactionsService.findAll(
      req.user.userId,
      pageNum,
      limitNum,
    );
  }
}

