import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { MailModule } from "@app/common/mail/mail.module";
import { MailSchedulerService } from "./mail-scheduler.service";

@Module({
  imports: [PrismaModule, MailModule],
  providers: [MailSchedulerService],
})
export class MailSchedulerModule {}
