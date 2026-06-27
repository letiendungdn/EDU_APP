import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
        : undefined,
    genReqId: (req) => req.headers['x-request-id'] ?? randomUUID(),
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, id: req.id }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    customProps: () => ({ service: process.env.SERVICE_NAME ?? 'unknown' }),
  },
};
