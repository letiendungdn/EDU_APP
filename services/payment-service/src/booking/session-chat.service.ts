import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@app/prisma";

const senderSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
} as const;

@Injectable()
export class SessionChatService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertParticipant(sessionId: number, userId: number) {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        learnerId: true,
        coach: { select: { userId: true } },
      },
    });
    if (!session) throw new NotFoundException("Session không tồn tại");
    const coachUserId = session.coach?.userId;
    if (session.learnerId !== userId && coachUserId !== userId) {
      throw new ForbiddenException("Chỉ học viên và coach mới nhắn được");
    }
    return session;
  }

  async getMessages(sessionId: number, userId: number) {
    await this.assertParticipant(sessionId, userId);
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: { sender: { select: senderSelect } },
    });
  }

  async sendMessage(
    sessionId: number,
    senderId: number,
    content: string,
    fileUrl?: string,
    fileType?: string,
  ) {
    await this.assertParticipant(sessionId, senderId);
    const message = await this.prisma.chatMessage.create({
      data: { sessionId, senderId, content, fileUrl, fileType },
      include: { sender: { select: senderSelect } },
    });

    await this.prisma.chatMessage.updateMany({
      where: { sessionId, readAt: null, NOT: { senderId } },
      data: { readAt: new Date() },
    });

    return message;
  }

  async markRead(sessionId: number, userId: number) {
    await this.assertParticipant(sessionId, userId);
    await this.prisma.chatMessage.updateMany({
      where: { sessionId, readAt: null, NOT: { senderId: userId } },
      data: { readAt: new Date() },
    });
  }
}
