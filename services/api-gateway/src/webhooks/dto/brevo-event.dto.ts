/** Subset of Brevo's webhook payload we actually need. */
export class BrevoWebhookEventDto {
  event: string; // hard_bounce | soft_bounce | complaint | unsubscribe | delivered | ...
  email: string;
  'message-id'?: string;
  tags?: string[];
  date?: string;
  reason?: string;
}
