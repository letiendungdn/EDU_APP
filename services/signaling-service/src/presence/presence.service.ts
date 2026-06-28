import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

const PRESENCE_TTL_SEC = 120;
const KEY_PREFIX = 'vc:presence:';

@Injectable()
export class PresenceService implements OnModuleInit {
  private redis!: Redis;
  private userSockets = new Map<number, Set<string>>();

  onModuleInit() {
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    this.redis.on('error', (err) => {
      console.error('[PresenceService] Redis error:', err.message);
    });
  }

  private key(userId: number) {
    return `${KEY_PREFIX}${userId}`;
  }

  async addSocket(userId: number, socketId: string): Promise<number[]> {
    let sockets = this.userSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);
    await this.redis.set(this.key(userId), String(Date.now()), 'EX', PRESENCE_TTL_SEC);
    return this.listOnlineUserIds();
  }

  async removeSocket(userId: number, socketId: string): Promise<number[]> {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return this.listOnlineUserIds();

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      await this.redis.del(this.key(userId));
    } else {
      await this.redis.expire(this.key(userId), PRESENCE_TTL_SEC);
    }
    return this.listOnlineUserIds();
  }

  async refresh(userId: number): Promise<void> {
    if (!this.userSockets.has(userId)) return;
    await this.redis.set(this.key(userId), String(Date.now()), 'EX', PRESENCE_TTL_SEC);
  }

  async listOnlineUserIds(): Promise<number[]> {
    return [...this.userSockets.keys()].sort((a, b) => a - b);
  }
}
