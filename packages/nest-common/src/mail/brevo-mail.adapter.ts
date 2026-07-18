import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MailMessage, MailPort } from './mail.port';

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email';
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 500;

@Injectable()
export class BrevoMailAdapter implements MailPort {
  readonly provider = 'brevo';
  private readonly logger = new Logger(BrevoMailAdapter.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('mail.brevoApiKey') ?? '';
    this.senderEmail =
      config.get<string>('mail.fromEmail') ?? 'noreply@nihongo.local';
    this.senderName = config.get<string>('mail.fromName') ?? 'Nihongo EDU';
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is empty');
    }

    const attachment = message.attachments?.map((a) =>
      'url' in a && a.url
        ? { name: a.filename, url: a.url }
        : { name: a.filename, content: (a as { content: string }).content },
    );

    const body = {
      sender: { email: this.senderEmail, name: this.senderName },
      to: [{ email: message.to.email, name: message.to.name }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      tags: message.tags,
      ...(attachment?.length ? { attachment } : {}),
    };

    await this.fetchWithRetry(body, message.to.email);

    this.logger.log(
      { to: message.to.email, subject: message.subject, tags: message.tags },
      'Brevo email accepted',
    );
  }

  private async fetchWithRetry(
    body: object,
    toEmail: string,
    attempt = 0,
  ): Promise<void> {
    const res = await fetch(BREVO_SMTP_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return;

    const detail = await res.text().catch(() => '');

    // Retry on 429 (rate limit) and 5xx (server errors) with exponential backoff + jitter
    const isRetryable = res.status === 429 || res.status >= 500;
    if (isRetryable && attempt < MAX_RETRIES) {
      const backoffMs =
        BACKOFF_BASE_MS * 2 ** attempt + Math.floor(Math.random() * 200);
      this.logger.warn(
        { status: res.status, attempt: attempt + 1, backoffMs, to: toEmail },
        'Brevo transient error — retrying',
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return this.fetchWithRetry(body, toEmail, attempt + 1);
    }

    this.logger.error(
      { status: res.status, detail: detail.slice(0, 500), to: toEmail },
      'Brevo send failed',
    );
    throw new Error(`Brevo API ${res.status}`);
  }
}
