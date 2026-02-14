import { SkipThrottle } from '@nestjs/throttler';

export const DefaultThrottle = () => SkipThrottle({ auth: true, transactions: true, strict: true });
export const AuthThrottle = () => SkipThrottle({ default: true, transactions: true, strict: true });
export const TransactionThrottle = () => SkipThrottle({ default: true, auth: true, strict: true });
export const StrictThrottle = () => SkipThrottle({ default: true, auth: true, transactions: true });
export const SkipAllThrottle = () => SkipThrottle();