import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RefreshTokenRequestDto } from './dto/request/refreshToken.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { LogoutResponseDto } from './dto/response/logout.response.dto';
import { RefreshTokenResponseDto } from './dto/response/refreshToken.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthThrottle } from 'src/infrastructure/rate-limiter/decorators/throttle.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @AuthThrottle()
  @ApiOperation({ summary: 'Register a new merchant' })
  @ApiCreatedResponse({
    description: 'Merchant successfully registered',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @AuthThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login merchant and receive JWT tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout merchant and invalidate refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(@Req() req: AuthenticatedRequest): Promise<LogoutResponseDto> {
    return this.authService.logout(req.user.sub);
  }

  @Post('refresh')
  @AuthThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful',
    type: RefreshTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}