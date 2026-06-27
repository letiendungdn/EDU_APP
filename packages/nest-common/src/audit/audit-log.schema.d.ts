import { Document } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    userId: number;
    action: string;
    resource: string;
    metadata: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    durationMs?: number;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, any, any, AuditLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, AuditLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<number, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<string, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resource?: import("mongoose").SchemaDefinitionProperty<string, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ip?: import("mongoose").SchemaDefinitionProperty<string | undefined, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userAgent?: import("mongoose").SchemaDefinitionProperty<string | undefined, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    success?: import("mongoose").SchemaDefinitionProperty<boolean, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    errorMessage?: import("mongoose").SchemaDefinitionProperty<string | undefined, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    durationMs?: import("mongoose").SchemaDefinitionProperty<number | undefined, AuditLog, Document<unknown, {}, AuditLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AuditLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, AuditLog>;
