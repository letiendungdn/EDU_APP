import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUserPayload {
  id: number;
  email: string;
  role: Role;
  name: string | null;
}

export interface AuthRequest {
  user?: AuthUserPayload | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authenticated user not found');
    }
    return user;
  },
);
