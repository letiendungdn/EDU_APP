import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditService } from './audit.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditService;
    constructor(auditService: AuditService);
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown>;
}
