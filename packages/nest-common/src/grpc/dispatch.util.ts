import { HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export type PatternHandler = (
  payload: unknown,
) => unknown | Promise<unknown>;

export type GrpcDispatchRequest = {
  pattern: string;
  payload: string;
};

export type GrpcDispatchResponse = {
  result: string;
  error: string;
};

function serializeException(exception: unknown): string {
  if (exception instanceof RpcException) {
    const error = exception.getError();
    if (typeof error === 'object' && error !== null) {
      return JSON.stringify(error);
    }
    return String(error);
  }

  if (exception instanceof HttpException) {
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
    return JSON.stringify({ statusCode: status, message });
  }

  if (exception instanceof Error) {
    return exception.message;
  }

  return String(exception);
}

export async function handleGrpcDispatch(
  routes: Record<string, PatternHandler>,
  data: GrpcDispatchRequest,
): Promise<GrpcDispatchResponse> {
  try {
    const handler = routes[data.pattern];
    if (!handler) {
      return { result: '', error: `Unknown pattern: ${data.pattern}` };
    }

    const payload = data.payload ? JSON.parse(data.payload) : {};
    const result = await handler(payload);
    return { result: JSON.stringify(result ?? null), error: '' };
  } catch (exception) {
    return { result: '', error: serializeException(exception) };
  }
}
