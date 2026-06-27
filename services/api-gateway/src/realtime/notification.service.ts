import { Injectable } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma";

export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async send(dto: CreateNotificationDto): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getUnread(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markRead(userId: number, notificationIds: number[]) {
    return this.prisma.notification.updateMany({
      where: { userId, id: { in: notificationIds } },
      data: { readAt: new Date() },
    });
  }
}
