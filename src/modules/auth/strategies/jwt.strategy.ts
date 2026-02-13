import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from 'src/common/utils/env.util';
import { Repository } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private configService: ConfigService,
  ) {
    const env = getEnv(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwtSecret,
    });
  }

  async validate(payload: any) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: payload.sub },
    });

    if (!merchant) {
      throw new UnauthorizedException('Invalid token');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
