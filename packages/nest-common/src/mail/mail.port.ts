export const MAIL_PORT = Symbol('MAIL_PORT');
export const MAIL_TEMPLATE_STORE = Symbol('MAIL_TEMPLATE_STORE');

export type MailAddress = {
  email: string;
  name?: string;
};

export type MailAttachment =
  | { filename: string; url: string; content?: never }
  | { filename: string; content: string; contentType?: string; url?: never };

export type MailMessage = {
  to: MailAddress;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
  attachments?: MailAttachment[];
};

/**
 * Outbound email port — Auth/domain depends on this, not Brevo.
 * Swap adapter (Brevo / SES / Noop) without touching callers.
 */
export interface MailPort {
  readonly provider: string;
  send(message: MailMessage): Promise<void>;
}

/** DB-backed template store — optional; injected via MAIL_TEMPLATE_STORE token. */
export interface MailTemplateStore {
  findActive(name: string): Promise<{
    subject: string;
    htmlBody: string;
    textBody: string;
    attachments: Array<{ filename: string; url: string }>;
  } | null>;
}
