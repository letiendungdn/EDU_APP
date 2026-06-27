import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { NotificationService } from "./notification.service";
import { GroupChatService } from "./group-chat.service";
import { SupportChatService } from "./support-chat.service";

@Module({
  imports: [PrismaModule],
  providers: [GroupChatService, SupportChatService, NotificationService],
  exports: [NotificationService, SupportChatService, GroupChatService],
})
export class RealtimeModule {}
