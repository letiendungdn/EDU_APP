import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, timeout } from 'rxjs';
import { Public } from '@app/common';
import { CONTENT_PATTERNS, EXAM_PATTERNS } from '@app/contracts';
import { PrismaService } from '@app/prisma';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    @Inject('CONTENT_SERVICE') private contentClient: ClientProxy,
    @Inject('EXAM_SERVICE') private examClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check — DB + microservices' })
  async check() {
    let database: 'up' | 'down' = 'down';
    let content: 'up' | 'down' = 'down';
    let exam: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }

    try {
      await firstValueFrom(
        this.contentClient
          .send(CONTENT_PATTERNS.GET_LESSONS, {})
          .pipe(timeout(3000)),
      );
      content = 'up';
    } catch {
      content = 'down';
    }

    try {
      await firstValueFrom(
        this.examClient
          .send(EXAM_PATTERNS.LIST_TEMPLATES, {})
          .pipe(timeout(3000)),
      );
      exam = 'up';
    } catch {
      exam = 'down';
    }

    const status =
      database === 'up' && content === 'up' && exam === 'up'
        ? 'ok'
        : 'degraded';

    return {
      status,
      services: { database, content, exam },
    };
  }
}
