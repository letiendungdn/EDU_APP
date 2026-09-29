import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Histogram } from "prom-client";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";

/**
 * Nhãn `route` là MẪU route ("/api/vocabularies/:id"), không phải URL thật —
 * URL thật sinh một time series cho mỗi id (bùng nổ cardinality trong Prometheus).
 */
export function routeLabel(req: Request): string {
  const pattern = (req.route as { path?: unknown } | undefined)?.path;
  return typeof pattern === "string" ? pattern : "unmatched";
}

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_requests_total")
    private readonly counter: Counter<string>,
    @InjectMetric("http_request_duration_seconds")
    private readonly histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const route = routeLabel(req);
    const endTimer = this.histogram.startTimer({ method, route });

    const record = (status: string) => {
      this.counter.inc({ method, route, status });
      endTimer({ status });
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          record(String(res.statusCode));
        },
        error: (err: { status?: number; statusCode?: number }) => {
          record(String(err?.status ?? err?.statusCode ?? 500));
        },
      }),
    );
  }
}
