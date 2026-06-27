import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import type { AuthRequest } from './current-user.decorator';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!token) {
      request.user = null;
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      return null as T;
    }
    return user;
  }
}
