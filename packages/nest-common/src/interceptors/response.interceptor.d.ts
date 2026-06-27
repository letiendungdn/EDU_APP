import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    timestamp: string;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T> | T> {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T> | T>;
}
