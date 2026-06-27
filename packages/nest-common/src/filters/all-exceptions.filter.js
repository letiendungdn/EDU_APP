"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const rpc_error_1 = require("../utils/rpc-error");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_ERROR';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'string') {
                message = body;
            }
            else if (typeof body === 'object' && body !== null) {
                const obj = body;
                const rawMessage = obj.message;
                if (Array.isArray(rawMessage)) {
                    message = rawMessage.join(', ');
                }
                else if (typeof rawMessage === 'string') {
                    message = rawMessage;
                }
                else {
                    message = exception.message;
                }
            }
            code = common_1.HttpStatus[status] ?? `HTTP_${status}`;
            if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
                void captureSentryException(exception);
            }
        }
        else {
            const rpc = (0, rpc_error_1.resolveMicroserviceError)(exception);
            if (rpc) {
                status = rpc.status;
                message = rpc.message;
                code = common_1.HttpStatus[status] ?? `HTTP_${status}`;
            }
            else if (exception instanceof Error) {
                this.logger.error(`Unhandled error on ${request.method} ${request.url}`, exception.stack);
                void captureSentryException(exception);
                message = exception.message;
            }
            else {
                this.logger.error(`Unknown error on ${request.method} ${request.url}`, String(exception));
                void captureSentryException(exception);
            }
        }
        const payload = {
            success: false,
            error: { code, message },
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        response.status(status).json(payload);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
async function captureSentryException(exception) {
    try {
        const Sentry = await import('@sentry/nestjs');
        Sentry.captureException(exception);
    }
    catch {
    }
}
//# sourceMappingURL=all-exceptions.filter.js.map