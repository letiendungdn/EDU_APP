import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  LogListeningDto,
  PROGRESS_PATTERNS,
  SyncReviewDto,
  UpsertDailyNoteDto,
  UpsertDailyGoalsDto,
} from '@app/contracts';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import type { AuthUserPayload } from '@app/common';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/progress')
export class ProgressController {
  constructor(
    @Inject('EXAM_SERVICE') private readonly examClient: ClientProxy,
  ) {}

  @Post('review')
  @ApiOperation({ summary: 'Sync mistake vocab review bank' })
  syncReview(@CurrentUser() user: AuthUserPayload, @Body() dto: SyncReviewDto) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.SYNC_REVIEW, {
        userId: user.id,
        dto,
      }),
    );
  }

  @Get('review')
  @ApiOperation({ summary: 'Get user review bank' })
  getReview(@CurrentUser() user: AuthUserPayload) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.GET_REVIEW_BANK, {
        userId: user.id,
      }),
    );
  }

  @Post('listening')
  @ApiOperation({ summary: 'Log listening session duration' })
  logListening(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: LogListeningDto,
  ) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.LOG_LISTENING, {
        userId: user.id,
        dto,
      }),
    );
  }

  @Get('listening')
  @ApiOperation({ summary: 'Get listening history' })
  getListening(@CurrentUser() user: AuthUserPayload) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.GET_LISTENING_LOGS, {
        userId: user.id,
      }),
    );
  }

  @Get('notes')
  @ApiOperation({ summary: 'List daily study notes' })
  getDailyNotes(@CurrentUser() user: AuthUserPayload) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.GET_DAILY_NOTES, {
        userId: user.id,
      }),
    );
  }

  @Put('notes')
  @ApiOperation({ summary: 'Create or update a daily note' })
  upsertDailyNote(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: UpsertDailyNoteDto,
  ) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.UPSERT_DAILY_NOTE, {
        userId: user.id,
        dto,
      }),
    );
  }

  @Get('goals')
  @ApiOperation({ summary: 'List daily study goals' })
  getDailyGoals(@CurrentUser() user: AuthUserPayload) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.GET_DAILY_GOALS, {
        userId: user.id,
      }),
    );
  }

  @Put('goals')
  @ApiOperation({ summary: 'Create or update daily goals' })
  upsertDailyGoals(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: UpsertDailyGoalsDto,
  ) {
    return firstValueFrom(
      this.examClient.send(PROGRESS_PATTERNS.UPSERT_DAILY_GOALS, {
        userId: user.id,
        dto,
      }),
    );
  }
}
