import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@app/prisma';
import { MailModule, MAIL_TEMPLATE_STORE } from '@app/common';
import { EmailTemplateService } from './email-template.service';
import { EmailBroadcastProcessor, EMAIL_BROADCAST_QUEUE } from './email-broadcast.processor';

@Global()
@Module({
  imports: [
    PrismaModule,
    MailModule,
    BullModule.registerQueue({ name: EMAIL_BROADCAST_QUEUE }),
  ],
  providers: [
    EmailTemplateService,
    EmailBroadcastProcessor,
    { provide: MAIL_TEMPLATE_STORE, useExisting: EmailTemplateService },
  ],
  exports: [EmailTemplateService, MAIL_TEMPLATE_STORE],
})
export class EmailTemplateModule {}
