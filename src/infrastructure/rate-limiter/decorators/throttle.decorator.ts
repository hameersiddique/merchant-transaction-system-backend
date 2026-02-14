import { Throttle } from '@nestjs/throttler';
import { SetMetadata } from '@nestjs/common';

export const DefaultThrottle = () => Throttle({ default: { limit: 1 } });
export const AuthThrottle = () => Throttle({ auth: { limit: 1 } });
export const TransactionThrottle = () => Throttle({ transactions: { limit: 1 } });
export const StrictThrottle = () => Throttle({ strict: { limit: 1 } });
export const SkipThrottle = () => SetMetadata('skipThrottle', true);