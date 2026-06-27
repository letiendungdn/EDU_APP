import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RAW_RESPONSE_KEY } from './raw-response.decorator';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | T> {
    return next.handle().pipe(
      map((data) => {
        const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (isRaw) return data as ApiSuccessResponse<T>;
        return {
          success: true as const,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
