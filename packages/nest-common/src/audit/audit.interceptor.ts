import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import type { AuthRequest } from '../auth/current-user.decorator';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<AuthRequest & { ip?: string; method: string; url: string; headers: Record<string, string | undefined> }>();
    const start = Date.now();
    const user = req.user;
    if (!user) return next.handle();

    const resource = ctx.getClass().name.replace('Controller', '').toLowerCase();
    const action = `${resource}.${ctx.getHandler().name}`;

    return next.handle().pipe(
      tap(() => {
        void this.auditService.log({
          userId: user.id,
          action,
          resource,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: true,
          durationMs: Date.now() - start,
          metadata: { method: req.method, path: req.url },
        });
      }),
      catchError((err: Error) => {
        void this.auditService.log({
          userId: user.id,
          action,
          resource,
          ip: req.ip,
          success: false,
          errorMessage: err.message,
          durationMs: Date.now() - start,
        });
        return throwError(() => err);
      }),
    );
  }
}
