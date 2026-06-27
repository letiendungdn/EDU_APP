import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  userId!: number;

  @Prop({ required: true, index: true })
  action!: string;

  @Prop({ required: true })
  resource!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ index: true })
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: true })
  success!: boolean;

  @Prop()
  errorMessage?: string;

  @Prop({ index: true })
  durationMs?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);
