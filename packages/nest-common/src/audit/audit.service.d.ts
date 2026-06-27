import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';
export interface LogActionParams {
    userId: number;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
    durationMs?: number;
}
export declare class AuditService {
    private auditModel;
    constructor(auditModel: Model<AuditLogDocument>);
    log(params: LogActionParams): Promise<void>;
    findByUser(userId: number, limit?: number): Promise<(AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getStats(userId: number, days?: number): Promise<any[]>;
}
