import { Controller, Get, Inject, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { PROGRESS_PATTERNS } from '@app/contracts';
import type { AuthUserPayload } from '@app/common';

@ApiTags('analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(
    @Inject('EXAM_SERVICE') private readonly examClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get learning analytics for current user' })
  getAnalytics(@Req() req: { user: AuthUserPayload }) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.GET_ANALYTICS, {
        userId: req.user.id,
      }),
    );
  }
}
