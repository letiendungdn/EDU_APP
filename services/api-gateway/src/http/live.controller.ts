import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  CurrentUser,
  JwtAuthGuard,
  Public,
  Roles,
  RolesGuard,
  type AuthUserPayload,
} from "@app/common";
import { CreateLiveSessionDto } from "./dto/live.dto";
import { LiveService } from "./live.service";

@ApiTags("live")
@Controller("api/live")
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get("sessions")
  @Public()
  @ApiOperation({ summary: "Danh sách phòng đang live" })
  listSessions() {
    return this.liveService.listLiveSessions();
  }

  @Post("sessions")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: "Coach tạo phòng livestream" })
  createSession(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: CreateLiveSessionDto,
  ) {
    return this.liveService.createLiveSession(user.id, dto.title);
  }

  @Post("sessions/:id/join")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Viewer lấy token vào xem" })
  joinSession(
    @CurrentUser() user: AuthUserPayload,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.liveService.joinAsViewer(user.id, id);
  }

  @Delete("sessions/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: "Coach kết thúc livestream" })
  async endSession(
    @CurrentUser() user: AuthUserPayload,
    @Param("id", ParseIntPipe) id: number,
  ) {
    await this.liveService.endLiveSession(id, user.id);
    return { ok: true };
  }

  @Get("sessions/:id/viewers")
  @Public()
  @ApiOperation({ summary: "Số người đang xem" })
  viewerCount(@Param("id", ParseIntPipe) id: number) {
    return this.liveService.getViewerCount(id);
  }
}
