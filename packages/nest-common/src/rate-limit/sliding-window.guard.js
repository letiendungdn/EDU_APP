"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidingWindowRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const redis_module_1 = require("../redis/redis.module");
const rate_limit_decorator_1 = require("./rate-limit.decorator");
let SlidingWindowRateLimitGuard = class SlidingWindowRateLimitGuard {
    reflector;
    redis;
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(ctx) {
        const config = this.reflector.get(rate_limit_decorator_1.RATE_LIMIT_KEY, ctx.getHandler());
        if (!config)
            return true;
        const req = ctx.switchToHttp().getRequest();
        const key = `rl:${req.ip ?? 'unknown'}:${ctx.getClass().name}:${ctx.getHandler().name}`;
        const now = Date.now();
        const window = config.windowSec * 1000;
        const pipe = this.redis.pipeline();
        pipe.zremrangebyscore(key, 0, now - window);
        pipe.zcard(key);
        pipe.zadd(key, now, `${now}-${Math.random()}`);
        pipe.expire(key, config.windowSec + 1);
        const results = await pipe.exec();
        const count = results?.[1]?.[1] ?? 0;
        if (count >= config.limit) {
            throw new common_1.HttpException({ message: 'Too many requests', retryAfter: config.windowSec }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.SlidingWindowRateLimitGuard = SlidingWindowRateLimitGuard;
exports.SlidingWindowRateLimitGuard = SlidingWindowRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [core_1.Reflector, Function])
], SlidingWindowRateLimitGuard);
//# sourceMappingURL=sliding-window.guard.js.map