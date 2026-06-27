"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGrpcDispatch = handleGrpcDispatch;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
function serializeException(exception) {
    if (exception instanceof microservices_1.RpcException) {
        const error = exception.getError();
        if (typeof error === 'object' && error !== null) {
            return JSON.stringify(error);
        }
        return String(error);
    }
    if (exception instanceof common_1.HttpException) {
        const status = exception.getStatus();
        const response = exception.getResponse();
        let message;
        if (typeof response === 'string') {
            message = response;
        }
        else if (typeof response === 'object' && response !== null) {
            const raw = response.message;
            message = Array.isArray(raw)
                ? raw.join(', ')
                : (raw ?? exception.message);
        }
        else {
            message = exception.message;
        }
        return JSON.stringify({ statusCode: status, message });
    }
    if (exception instanceof Error) {
        return exception.message;
    }
    return String(exception);
}
async function handleGrpcDispatch(routes, data) {
    try {
        const handler = routes[data.pattern];
        if (!handler) {
            return { result: '', error: `Unknown pattern: ${data.pattern}` };
        }
        const payload = data.payload ? JSON.parse(data.payload) : {};
        const result = await handler(payload);
        return { result: JSON.stringify(result ?? null), error: '' };
    }
    catch (exception) {
        return { result: '', error: serializeException(exception) };
    }
}
//# sourceMappingURL=dispatch.util.js.map