import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrevoMailAdapter } from './brevo-mail.adapter';
import { MAIL_PORT } from './mail.port';
import { MailService } from './mail.service';
import { NoopMailAdapter } from './noop-mail.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    BrevoMailAdapter,
    NoopMailAdapter,
    {
      provide: MAIL_PORT,
      inject: [ConfigService, BrevoMailAdapter, NoopMailAdapter],
      useFactory: (
        config: ConfigService,
        brevo: BrevoMailAdapter,
        noop: NoopMailAdapter,
      ) => {
        const key = (config.get<string>('mail.brevoApiKey') ?? '').trim();
        return key ? brevo : noop;
      },
    },
    MailService,
  ],
  exports: [MailService, MAIL_PORT],
})
export class MailModule {}
