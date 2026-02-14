import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { getEnv } from 'src/common/utils/env.util';
import { LoggerService } from 'src/infrastructure/logging/logger.service';
import { AuthRepository } from './auth.repository';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RefreshTokenRequestDto } from './dto/request/refreshToken.request.dto';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { LogoutResponseDto } from './dto/response/logout.response.dto';
import { RefreshTokenResponseDto } from './dto/response/refreshToken.response.dto';
import { RegisterResponseDto } from './dto/response/register.response.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_EXPIRES_IN: number;
  private readonly REFRESH_TOKEN_EXPIRY: number;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    const env = getEnv(this.configService);
    this.JWT_EXPIRES_IN = env.jwtExpiresIn;
    this.REFRESH_TOKEN_EXPIRY = env.refreshTokenExpiry;
  }

  async register(
    registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const { name, email, password } = registerDto;

    const emailExists = await this.authRepository.emailExists(email);
    if (emailExists) {
      this.logger.warn(`Registration failed: Email ${email} already exists`);
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const merchant = await this.authRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    this.logger.log(`Merchant created successfully: ${merchant.id}`);

    const { password: _, ...result } = merchant;
    return result;
  }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const merchant = await this.authRepository.findByEmail(email);
    if (!merchant) {
      this.logger.warn(`Login failed: Merchant not found for email ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.validatePassword(
      password,
      merchant.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(merchant.id, merchant.email);
    const refreshToken = this.generateRefreshToken(merchant.id);

    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.authRepository.updateRefreshToken(merchant.id, hashedRefreshToken);

    this.logger.log(`Merchant logged in successfully: ${merchant.id}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      },
    };
  }

  async logout(merchantId: string): Promise<LogoutResponseDto> {
    await this.authRepository.updateRefreshToken(merchantId, null);

    this.logger.log(`Merchant logged out successfully: ${merchantId}`);

    return {
      message: 'Logout successful',
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refresh_token } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refresh_token);
      const merchantId = payload.sub;

      const merchant = await this.authRepository.findById(merchantId);
      if (!merchant || !merchant.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await this.validatePassword(
        refresh_token,
        merchant.refreshToken,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(
        merchant.id,
        merchant.email,
      );
      const newRefreshToken = this.generateRefreshToken(merchant.id);

      const hashedRefreshToken = await this.hashPassword(newRefreshToken);
      await this.authRepository.updateRefreshToken(
        merchant.id,
        hashedRefreshToken,
      );

      this.logger.log(`token refreshed`);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      this.logger.warn(`token refresh failed: ${error}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateMerchant(merchantId: string) {
    const merchant = await this.authRepository.findById(merchantId);
    if (!merchant) {
      throw new UnauthorizedException('Invalid merchant');
    }
    return merchant;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateAccessToken(merchantId: string, email: string): string {
    const payload = { email, sub: merchantId, type: 'access' };
    return this.jwtService.sign(payload, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private generateRefreshToken(merchantId: string): string {
    const payload = { sub: merchantId, type: 'refresh' };
    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }
}