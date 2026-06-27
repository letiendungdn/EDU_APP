import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';

@Injectable()
export class SlidingWindowRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<{ limit: number; windowSec: number }>(
      RATE_LIMIT_KEY,
      ctx.getHandler(),
    );
    if (!config) return true;

    const req = ctx.switchToHttp().getRequest<{
      ip?: string;
    }>();
    const key = `rl:${req.ip ?? 'unknown'}:${ctx.getClass().name}:${ctx.getHandler().name}`;
    const now = Date.now();
    const window = config.windowSec * 1000;

    const pipe = this.redis.pipeline();
    pipe.zremrangebyscore(key, 0, now - window);
    pipe.zcard(key);
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    pipe.expire(key, config.windowSec + 1);

    const results = await pipe.exec();
    const count = (results?.[1]?.[1] as number) ?? 0;

    if (count >= config.limit) {
      throw new HttpException(
        { message: 'Too many requests', retryAfter: config.windowSec },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
