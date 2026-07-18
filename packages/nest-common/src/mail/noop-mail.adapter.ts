import { Injectable, Logger } from '@nestjs/common';
import type { MailMessage, MailPort } from './mail.port';

/**
 * Used when BREVO_API_KEY is missing — local/dev never blocks on email.
 * Logs payload metadata only (no full HTML) to avoid leaking reset links in prod logs by accident.
 */
@Injectable()
export class NoopMailAdapter implements MailPort {
  readonly provider = 'noop';
  private readonly logger = new Logger(NoopMailAdapter.name);

  async send(message: MailMessage): Promise<void> {
    this.logger.warn(
      {
        to: message.to.email,
        subject: message.subject,
        tags: message.tags,
      },
      'Mail skipped (noop) — set BREVO_API_KEY to enable Brevo',
    );
  }
}
