import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@app/common';

const KEY_PREFIX = 'vc:presence:';

@Injectable()
export class VideoPresenceService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async listOnlineUserIds(): Promise<number[]> {
    const keys = await this.redis.keys(`${KEY_PREFIX}*`);
    return keys
      .map((k) => parseInt(k.slice(KEY_PREFIX.length), 10))
      .filter((id) => !Number.isNaN(id))
      .sort((a, b) => a - b);
  }
}
