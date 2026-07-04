import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { PrismaService } from "@app/prisma";

export type LiveRole = "host" | "viewer";

@Injectable()
export class LiveService {
  private roomClient: RoomServiceClient | null = null;

  constructor(private readonly prisma: PrismaService) {
    const url = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (url && apiKey && apiSecret) {
      this.roomClient = new RoomServiceClient(url, apiKey, apiSecret);
    }
  }

  private get publicWsUrl(): string {
    return (
      process.env.LIVEKIT_PUBLIC_URL ??
      process.env.LIVEKIT_URL?.replace("http://", "ws://").replace(
        "https://",
        "wss://",
      ) ??
      "ws://localhost:7880"
    );
  }

  private ensureLiveKit(): RoomServiceClient {
    if (!this.roomClient) {
      throw new ServiceUnavailableException(
        "LiveKit chưa cấu hình (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)",
      );
    }
    return this.roomClient;
  }

  private createToken(
    userId: number,
    roomName: string,
    role: LiveRole,
  ): Promise<string> {
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: String(userId),
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: role === "host",
      canPublishData: true,
      canSubscribe: true,
    });

    return at.toJwt();
  }

  async listLiveSessions() {
    return this.prisma.liveSession.findMany({
      where: { status: "LIVE" },
      orderBy: { startedAt: "desc" },
      include: {
        coach: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async createLiveSession(coachId: number, title: string) {
    const roomClient = this.ensureLiveKit();
    const roomName = `live_${coachId}_${Date.now()}`;

    await roomClient.createRoom({
      name: roomName,
      emptyTimeout: 300,
      maxParticipants: 200,
      metadata: JSON.stringify({ coachId, title }),
    });

    const session = await this.prisma.liveSession.create({
      data: {
        roomName,
        coachId,
        title,
        status: "LIVE",
      },
      include: {
        coach: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return {
      sessionId: session.id,
      roomName: session.roomName,
      title: session.title,
      token: await this.createToken(coachId, roomName, "host"),
      wsUrl: this.publicWsUrl,
      session,
    };
  }

  async joinAsViewer(userId: number, sessionId: number) {
    this.ensureLiveKit();

    const session = await this.prisma.liveSession.findFirst({
      where: { id: sessionId, status: "LIVE" },
    });
    if (!session) {
      throw new NotFoundException("Phòng không tồn tại hoặc đã kết thúc");
    }

    return {
      sessionId: session.id,
      roomName: session.roomName,
      title: session.title,
      token: await this.createToken(userId, session.roomName, "viewer"),
      wsUrl: this.publicWsUrl,
    };
  }

  async endLiveSession(sessionId: number, coachId: number) {
    const roomClient = this.ensureLiveKit();

    const session = await this.prisma.liveSession.findFirst({
      where: { id: sessionId, coachId },
    });
    if (!session) {
      throw new ForbiddenException("Không có quyền kết thúc phòng này");
    }

    try {
      await roomClient.deleteRoom(session.roomName);
    } catch {
      // room có thể đã bị xóa trên LiveKit
    }

    await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: { status: "ENDED", endedAt: new Date() },
    });
  }

  async getViewerCount(sessionId: number) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException("Session not found");

    if (!this.roomClient) {
      return { sessionId, viewerCount: 0, participants: 0 };
    }

    try {
      const participants = await this.roomClient.listParticipants(
        session.roomName,
      );
      const viewers = Math.max(0, participants.length - 1);
      return {
        sessionId,
        viewerCount: viewers,
        participants: participants.length,
      };
    } catch {
      return { sessionId, viewerCount: 0, participants: 0 };
    }
  }
}
