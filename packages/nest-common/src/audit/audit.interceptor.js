"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("./audit.service");
let AuditInterceptor = class AuditInterceptor {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    intercept(ctx, next) {
        const req = ctx.switchToHttp().getRequest();
        const start = Date.now();
        const user = req.user;
        if (!user)
            return next.handle();
        const resource = ctx.getClass().name.replace('Controller', '').toLowerCase();
        const action = `${resource}.${ctx.getHandler().name}`;
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            void this.auditService.log({
                userId: user.id,
                action,
                resource,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                success: true,
                durationMs: Date.now() - start,
                metadata: { method: req.method, path: req.url },
            });
        }), (0, rxjs_1.catchError)((err) => {
            void this.auditService.log({
                userId: user.id,
                action,
                resource,
                ip: req.ip,
                success: false,
                errorMessage: err.message,
                durationMs: Date.now() - start,
            });
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map