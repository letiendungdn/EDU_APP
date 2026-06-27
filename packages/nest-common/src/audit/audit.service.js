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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("./audit-log.schema");
let AuditService = class AuditService {
    auditModel;
    constructor(auditModel) {
        this.auditModel = auditModel;
    }
    async log(params) {
        this.auditModel.create(params).catch(() => { });
    }
    async findByUser(userId, limit = 50) {
        return this.auditModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
    }
    async getStats(userId, days = 7) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.auditModel.aggregate([
            { $match: { userId, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$durationMs' },
                    failCount: {
                        $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] },
                    },
                },
            },
            { $sort: { count: -1 } },
        ]);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditService);
//# sourceMappingURL=audit.service.js.map