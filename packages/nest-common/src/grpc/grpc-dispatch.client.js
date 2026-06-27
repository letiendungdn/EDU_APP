"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcDispatchClient = void 0;
const rxjs_1 = require("rxjs");
const rxjs_2 = require("rxjs");
class GrpcDispatchClient {
    dispatchService;
    serviceName;
    grpcClient;
    constructor(grpcClient, serviceName) {
        this.grpcClient = grpcClient;
        this.serviceName = serviceName;
    }
    onModuleInit() {
        this.dispatchService =
            this.grpcClient.getService(this.serviceName);
    }
    send(pattern, data) {
        return (0, rxjs_1.from)(this.invoke(pattern, data));
    }
    async invoke(pattern, data) {
        const response = await (0, rxjs_2.lastValueFrom)(this.dispatchService.dispatch({
            pattern,
            payload: JSON.stringify(data ?? {}),
        }));
        if (response.error) {
            try {
                const parsed = JSON.parse(response.error);
                if (parsed.statusCode) {
                    throw { statusCode: parsed.statusCode, message: parsed.message };
                }
            }
            catch (parseError) {
                if (parseError &&
                    typeof parseError === 'object' &&
                    'statusCode' in parseError) {
                    throw parseError;
                }
            }
            throw { status: 'error', message: response.error };
        }
        return (response.result ? JSON.parse(response.result) : null);
    }
}
exports.GrpcDispatchClient = GrpcDispatchClient;
//# sourceMappingURL=grpc-dispatch.client.js.map