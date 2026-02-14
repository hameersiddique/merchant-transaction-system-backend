import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnv } from 'src/common/utils/env.util';
import { LoggerService } from 'src/infrastructure/logging/logger.service';
import { Merchant } from '../merchants/entities/merchant.entity';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Merchant]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const env = getEnv(configService);
        return {
          secret: env.jwtSecret,
          signOptions: { expiresIn: env.jwtExpiresIn },
        };
      },
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoggerService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule { }
