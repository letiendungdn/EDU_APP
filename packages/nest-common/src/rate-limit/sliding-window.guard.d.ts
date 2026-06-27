import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type Redis from 'ioredis';
export declare class SlidingWindowRateLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly redis;
    constructor(reflector: Reflector, redis: Redis);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
