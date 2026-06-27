import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  EXAM_PATTERNS,
  LogListeningDto,
  PROGRESS_PATTERNS,
  SyncReviewDto,
  UpsertDailyNoteDto,
  UpsertDailyGoalsDto,
} from '@app/contracts';
import { handleGrpcDispatch, type PatternHandler } from '@app/common';
import { MockExamsService } from './modules/mock-exams/mock-exams.service';
import { ProgressService } from './modules/progress/progress.service';

@Controller()
export class ExamMsController implements OnModuleInit {
  private readonly logger = new Logger(ExamMsController.name);
  private routes!: Record<string, PatternHandler>;

  constructor(
    private readonly mockExamsService: MockExamsService,
    private readonly progressService: ProgressService,
  ) {}

  onModuleInit() {
    this.routes = {
      [EXAM_PATTERNS.LIST_TEMPLATES]: () => this.listTemplates(),
      [EXAM_PATTERNS.START_EXAM]: (data) =>
        this.startExam(data as { level: 'n5' | 'n4' }),
      [EXAM_PATTERNS.SUBMIT_EXAM]: (data) =>
        this.submitExam(
          data as {
            examId: string;
            answers: Record<string, string>;
            userId?: number;
          },
        ),
      [EXAM_PATTERNS.GET_HISTORY]: (data) =>
        this.getHistory(data as { userId: number }),
      [PROGRESS_PATTERNS.SYNC_REVIEW]: (data) =>
        this.syncReview(data as { userId: number; dto: SyncReviewDto }),
      [PROGRESS_PATTERNS.GET_REVIEW_BANK]: (data) =>
        this.getReviewBank(data as { userId: number }),
      [PROGRESS_PATTERNS.LOG_LISTENING]: (data) =>
        this.logListening(data as { userId: number; dto: LogListeningDto }),
      [PROGRESS_PATTERNS.GET_LISTENING_LOGS]: (data) =>
        this.getListeningLogs(data as { userId: number }),
      [PROGRESS_PATTERNS.GET_ANALYTICS]: (data) =>
        this.getAnalytics(data as { userId: number }),
      [PROGRESS_PATTERNS.UPSERT_DAILY_NOTE]: (data) =>
        this.upsertDailyNote(data as { userId: number; dto: UpsertDailyNoteDto }),
      [PROGRESS_PATTERNS.GET_DAILY_NOTES]: (data) =>
        this.getDailyNotes(data as { userId: number; limit?: number }),
      [PROGRESS_PATTERNS.UPSERT_DAILY_GOALS]: (data) =>
        this.upsertDailyGoals(
          data as { userId: number; dto: UpsertDailyGoalsDto },
        ),
      [PROGRESS_PATTERNS.GET_DAILY_GOALS]: (data) =>
        this.getDailyGoals(data as { userId: number; limit?: number }),
    };
  }

  @GrpcMethod('ExamService', 'Dispatch')
  dispatch(data: { pattern: string; payload: string }) {
    return handleGrpcDispatch(this.routes, data);
  }

  listTemplates() {
    return this.mockExamsService.listTemplates();
  }

  startExam(data: { level: 'n5' | 'n4' }) {
    return this.mockExamsService.start(data.level);
  }

  async submitExam(data: {
    examId: string;
    answers: Record<string, string>;
    userId?: number;
  }) {
    const result = await this.mockExamsService.submit(
      data.examId,
      data.answers,
      data.userId,
    );
    this.logger.log(
      `Exam submitted: examId=${data.examId} userId=${data.userId ?? 'guest'} level=${result.level} percent=${result.percent}% passed=${result.passed}`,
    );
    return result;
  }

  getHistory(data: { userId: number }) {
    return this.mockExamsService.getHistory(data.userId);
  }

  syncReview(data: { userId: number; dto: SyncReviewDto }) {
    return this.progressService.syncReviewBank(data.userId, data.dto);
  }

  getReviewBank(data: { userId: number }) {
    return this.progressService.getReviewBank(data.userId);
  }

  logListening(data: { userId: number; dto: LogListeningDto }) {
    return this.progressService.logListening(data.userId, data.dto);
  }

  getListeningLogs(data: { userId: number }) {
    return this.progressService.getListeningHistory(data.userId);
  }

  getAnalytics(data: { userId: number }) {
    return this.progressService.getAnalytics(data.userId);
  }

  upsertDailyNote(data: { userId: number; dto: UpsertDailyNoteDto }) {
    return this.progressService.upsertDailyNote(data.userId, data.dto);
  }

  getDailyNotes(data: { userId: number; limit?: number }) {
    return this.progressService.listDailyNotes(data.userId, data.limit);
  }

  upsertDailyGoals(data: { userId: number; dto: UpsertDailyGoalsDto }) {
    return this.progressService.upsertDailyGoals(data.userId, data.dto);
  }

  getDailyGoals(data: { userId: number; limit?: number }) {
    return this.progressService.listDailyGoals(data.userId, data.limit);
  }
}
