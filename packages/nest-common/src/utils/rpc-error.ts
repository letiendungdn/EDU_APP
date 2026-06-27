import { HttpStatus } from '@nestjs/common';

export function resolveMicroserviceError(
  exception: unknown,
): { status: number; message: string } | null {
  if (exception instanceof Error) {
    if (/không tồn tại|not found|hết hạn/i.test(exception.message)) {
      return { status: HttpStatus.NOT_FOUND, message: exception.message };
    }
  }

  if (!exception || typeof exception !== 'object') return null;
  const err = exception as Record<string, unknown>;

  if (typeof err.statusCode === 'number') {
    return {
      status: err.statusCode,
      message: typeof err.message === 'string' ? err.message : 'Request failed',
    };
  }

  if (err.status === 'error' && 'message' in err) {
    const inner = err.message;
    if (typeof inner === 'string') {
      try {
        const parsed = JSON.parse(inner) as {
          statusCode?: number;
          message?: string;
        };
        if (parsed.statusCode) {
          return {
            status: parsed.statusCode,
            message: parsed.message ?? inner,
          };
        }
      } catch {
        // plain string
      }
      if (/không tồn tại|not found/i.test(inner)) {
        return { status: HttpStatus.NOT_FOUND, message: inner };
      }
      return { status: HttpStatus.BAD_GATEWAY, message: inner };
    }

    if (typeof inner === 'object' && inner !== null) {
      const obj = inner as { statusCode?: number; message?: string | string[] };
      if (obj.statusCode) {
        const msg = obj.message;
        return {
          status: obj.statusCode,
          message: Array.isArray(msg)
            ? msg.join(', ')
            : (msg ?? 'Request failed'),
        };
      }
    }
  }

  return null;
}
