import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { resolveMicroserviceError } from '../utils/rpc-error';

export interface ApiErrorResponse {
  success: false;

  error: {
    code: string;

    message: string;
  };

  timestamp: string;

  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;

        const rawMessage = obj.message;

        if (Array.isArray(rawMessage)) {
          message = rawMessage.join(', ');
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else {
          message = exception.message;
        }
      }

      code = HttpStatus[status] ?? `HTTP_${status}`;

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        void captureSentryException(exception);
      }
    } else {
      const rpc = resolveMicroserviceError(exception);

      if (rpc) {
        status = rpc.status;

        message = rpc.message;

        code = HttpStatus[status] ?? `HTTP_${status}`;
      } else if (exception instanceof Error) {
        this.logger.error(
          `Unhandled error on ${request.method} ${request.url}`,

          exception.stack,
        );

        void captureSentryException(exception);

        message = exception.message;
      } else {
        this.logger.error(
          `Unknown error on ${request.method} ${request.url}`,

          String(exception),
        );

        void captureSentryException(exception);
      }
    }

    const payload: ApiErrorResponse = {
      success: false,

      error: { code, message },

      timestamp: new Date().toISOString(),

      path: request.url,
    };

    response.status(status).json(payload);
  }
}

async function captureSentryException(exception: unknown): Promise<void> {
  try {
    const Sentry = await import('@sentry/nestjs');
    Sentry.captureException(exception);
  } catch {
    // Sentry not installed or unavailable
  }
}
