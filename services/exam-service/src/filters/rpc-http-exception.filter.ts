import { Catch, HttpException } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(HttpException)
export class RpcHttpExceptionFilter extends BaseRpcExceptionFilter {
  override catch(exception: HttpException): Observable<never> {
    const status = exception.getStatus();
    const response = exception.getResponse();
    let message: string;
    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object' && response !== null) {
      const raw = (response as { message?: string | string[] }).message;
      message = Array.isArray(raw)
        ? raw.join(', ')
        : (raw ?? exception.message);
    } else {
      message = exception.message;
    }
    return throwError(() => ({ statusCode: status, message }));
  }
}
