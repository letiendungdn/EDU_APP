import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  CurrentUser,
  JwtAuthGuard,
  type AuthUserPayload,
} from "@app/common";
import { SupportChatService } from "../realtime/support-chat.service";

class SendMessageDto {
  content!: string;
}

@ApiTags("Support")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/support")
export class SupportController {
  constructor(private readonly support: SupportChatService) {}

  @Get()
  @ApiOperation({ summary: "Hội thoại hỗ trợ của user hiện tại" })
  getMyThread(@CurrentUser() user: AuthUserPayload) {
    return this.support.getUserThread(user.id);
  }

  @Post("messages")
  @ApiOperation({ summary: "Gửi tin nhắn hỗ trợ" })
  async sendMessage(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: SendMessageDto,
  ) {
    const thread = await this.support.getOrCreateThread(user.id);
    const { message } = await this.support.saveMessage(
      thread.id,
      user.id,
      body.content.trim(),
    );
    return { threadId: thread.id, message };
  }

  @Patch("read")
  @ApiOperation({ summary: "Đánh dấu đã đọc hội thoại hỗ trợ" })
  async markRead(@CurrentUser() user: AuthUserPayload) {
    const thread = await this.support.getOrCreateThread(user.id);
    await this.support.markRead(thread.id, user.id, user.role as Role);
    return { ok: true };
  }
}
