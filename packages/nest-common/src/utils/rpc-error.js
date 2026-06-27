"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMicroserviceError = resolveMicroserviceError;
const common_1 = require("@nestjs/common");
function resolveMicroserviceError(exception) {
    if (exception instanceof Error) {
        if (/không tồn tại|not found|hết hạn/i.test(exception.message)) {
            return { status: common_1.HttpStatus.NOT_FOUND, message: exception.message };
        }
    }
    if (!exception || typeof exception !== 'object')
        return null;
    const err = exception;
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
                const parsed = JSON.parse(inner);
                if (parsed.statusCode) {
                    return {
                        status: parsed.statusCode,
                        message: parsed.message ?? inner,
                    };
                }
            }
            catch {
            }
            if (/không tồn tại|not found/i.test(inner)) {
                return { status: common_1.HttpStatus.NOT_FOUND, message: inner };
            }
            return { status: common_1.HttpStatus.BAD_GATEWAY, message: inner };
        }
        if (typeof inner === 'object' && inner !== null) {
            const obj = inner;
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
//# sourceMappingURL=rpc-error.js.map