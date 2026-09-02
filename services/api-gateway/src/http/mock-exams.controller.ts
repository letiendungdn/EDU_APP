import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import {
  EXAM_PATTERNS,
  CreateMockExamTemplateDto,
  UpdateMockExamTemplateDto,
} from "@app/contracts";
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  Public,
  Roles,
  RolesGuard,
  resolveMicroserviceError,
} from "@app/common";
import type { AuthUserPayload } from "@app/common";

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

@ApiTags("mock-exams")
@Controller("api/mock-exams")
export class MockExamsController {
  constructor(
    @Inject("EXAM_SERVICE") private readonly examClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "List published mock exam templates" })
  list() {
    return sendExam(this.examClient, EXAM_PATTERNS.LIST_TEMPLATES, {});
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all mock exam templates (admin)" })
  listAdmin() {
    return sendExam(this.examClient, EXAM_PATTERNS.LIST_TEMPLATES_ADMIN, {});
  }

  @Get("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get mock exam template detail (admin)" })
  getOne(@Param("id", ParseIntPipe) id: number) {
    return sendExam(this.examClient, EXAM_PATTERNS.GET_TEMPLATE, { id });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create mock exam template (admin)" })
  create(@Body() dto: CreateMockExamTemplateDto) {
    return sendExam(this.examClient, EXAM_PATTERNS.CREATE_TEMPLATE, dto);
  }

  @Patch("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update mock exam template (admin)" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMockExamTemplateDto,
  ) {
    return sendExam(this.examClient, EXAM_PATTERNS.UPDATE_TEMPLATE, { id, dto });
  }

  @Delete("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete mock exam template (admin)" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return sendExam(this.examClient, EXAM_PATTERNS.DELETE_TEMPLATE, { id });
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Last 20 exam results for current user" })
  history(@Req() req: { user: AuthUserPayload }) {
    return sendExam(this.examClient, EXAM_PATTERNS.GET_HISTORY, {
      userId: req.user.id,
    });
  }

  @Post(":key/start")
  @Public()
  @ApiOperation({ summary: "Start a mock exam by slug or id" })
  start(@Param("key") key: string) {
    return sendExam(this.examClient, EXAM_PATTERNS.START_EXAM, { key });
  }

  @Post(":examId/submit")
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Submit mock exam answers" })
  submit(
    @Param("examId") examId: string,
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
