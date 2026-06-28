import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { NotificationService } from "./notification.service";
import { GroupChatService } from "./group-chat.service";
import { SupportChatService } from "./support-chat.service";
import { VideoPresenceService } from "./video-presence.service";

@Module({
  imports: [PrismaModule],
  providers: [
    GroupChatService,
    SupportChatService,
    NotificationService,
    VideoPresenceService,
  ],
  exports: [
    NotificationService,
    SupportChatService,
    GroupChatService,
    VideoPresenceService,
  ],
})
export class RealtimeModule {}
