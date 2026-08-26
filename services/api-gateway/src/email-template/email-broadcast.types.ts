import type { MailAttachment } from "@app/common";

export const EMAIL_BROADCAST_QUEUE = "email-broadcast";

export type SendTemplateJobData = {
  broadcastId: string;
  userId: number;
  email: string;
  name: string | null;
  templateName: string;
  customVars?: Record<string, unknown>;
};

export type ComposeJobData = {
  broadcastId: string;
  email: string;
  subject: string;
  html: string;
  text: string;
  attachments?: MailAttachment[];
};
