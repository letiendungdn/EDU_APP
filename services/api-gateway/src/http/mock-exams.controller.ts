import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { EXAM_PATTERNS } from '@app/contracts';
import {
  OptionalJwtAuthGuard,
  Public,
  resolveMicroserviceError,
} from '@app/common';
import type { AuthUserPayload } from '@app/common';

async function sendExam<T>(
  client: ClientProxy,
  pattern: string,
  data: unknown,
): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (err) {
    const rpc = resolveMicroserviceError(err);
    if (rpc) {
      throw new HttpException(rpc.message, rpc.status);
    }
    throw err;
  }
}

@ApiTags('mock-exams')
@Controller('api/mock-exams')
export class MockExamsController {
  constructor(
    @Inject('EXAM_SERVICE') private readonly examClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List mock exam templates' })
  list() {
    return sendExam(this.examClient, EXAM_PATTERNS.LIST_TEMPLATES, {});
  }

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Last 20 exam results for current user' })
  history(@Req() req: { user: AuthUserPayload }) {
    return sendExam(this.examClient, EXAM_PATTERNS.GET_HISTORY, {
      userId: req.user.id,
    });
  }

  @Post(':level/start')
  @Public()
  @ApiOperation({ summary: 'Start a mock exam' })
  start(@Param('level') level: string) {
    return sendExam(this.examClient, EXAM_PATTERNS.START_EXAM, { level });
  }

  @Post(':examId/submit')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Submit mock exam answers' })
  submit(
    @Param('examId') examId: string,
    @Body() body: { answers: Record<string, string> },
    @Req() req: { user?: AuthUserPayload | null },
  ) {
    return sendExam(this.examClient, EXAM_PATTERNS.SUBMIT_EXAM, {
      examId,
      answers: body.answers ?? {},
      userId: req.user?.id,
    });
  }
}
