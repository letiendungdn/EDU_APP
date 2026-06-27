"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinoConfig = void 0;
const crypto_1 = require("crypto");
exports.pinoConfig = {
    pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        genReqId: (req) => req.headers['x-request-id'] ?? (0, crypto_1.randomUUID)(),
        serializers: {
            req: (req) => ({ method: req.method, url: req.url, id: req.id }),
            res: (res) => ({ statusCode: res.statusCode }),
        },
        customProps: () => ({ service: process.env.SERVICE_NAME ?? 'unknown' }),
    },
};
//# sourceMappingURL=pino.config.js.map