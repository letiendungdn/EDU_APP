import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter } from "prom-client";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_requests_total")
    private readonly counter: Counter<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const path = req.path || req.url.split("?")[0] || "/";

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const status = String(res.statusCode);
          this.counter.inc({ method, path, status });
        },
        error: (err: { status?: number }) => {
          const status = String(err?.status ?? 500);
          this.counter.inc({ method, path, status });
        },
      }),
    );
  }
}
