import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  type AuthUserPayload,
} from "@app/common";
import { RefundService } from "../../../payment-service/src/refund/refund.service";
import { RequestRefundDto } from "../http/dto/refund.dto";
import { AdminService } from "./admin.service";
import { SupportChatService } from "../realtime/support-chat.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("api/admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly refundService: RefundService,
    private readonly supportChat: SupportChatService,
  ) {}

  @Get("stats")
  @ApiOperation({ summary: "Dashboard thống kê (admin only)" })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("users")
  @ApiOperation({ summary: "Danh sách users kèm số bài thi" })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post("import/vocab")
  @ApiOperation({ summary: "Import từ vựng từ text tab-separated" })
  importVocab(@Body() body: { lessonNumber: number; text: string }) {
    return this.adminService.importVocab(body.lessonNumber, body.text);
  }

  @Get("payments")
  @ApiOperation({ summary: "Danh sách thanh toán / hoàn tiền (admin)" })
  listPayments(
    @Query("userId") userId?: string,
    @Query("status") status?: PaymentStatus,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.refundService.listPaymentsForAdmin({
      userId: userId ? Number(userId) : undefined,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("users/:userId/payments")
  @ApiOperation({ summary: "Lịch sử thanh toán của một user (admin)" })
  listUserPayments(@Param("userId", ParseIntPipe) userId: number) {
    return this.refundService.listUserPayments(userId);
  }

  @Post("payments/:id/refund")
  @ApiOperation({ summary: "Admin hoàn tiền giao dịch (toàn phần hoặc một phần)" })
  refundPayment(
    @CurrentUser() user: AuthUserPayload,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: RequestRefundDto,
  ) {
    return this.refundService.refundPayment(id, {
      requestedByUserId: user.id,
      role: Role.ADMIN,
      reason: dto.reason,
      amountCents: dto.amountCents,
    });
  }

  @Get("support/threads")
  @ApiOperation({ summary: "Danh sách hội thoại hỗ trợ (admin)" })
  listSupportThreads() {
    return this.supportChat.listThreadsForAdmin();
  }

  @Get("support/threads/:id")
  @ApiOperation({ summary: "Chi tiết hội thoại hỗ trợ (admin)" })
  getSupportThread(@Param("id", ParseIntPipe) id: number) {
    return this.supportChat.getThreadForAdmin(id);
  }

  @Post("support/threads/:id/messages")
  @ApiOperation({ summary: "Admin trả lời hội thoại hỗ trợ" })
  async sendSupportMessage(
    @CurrentUser() user: AuthUserPayload,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { content: string },
  ) {
    const { message } = await this.supportChat.saveMessage(
      id,
      user.id,
      body.content.trim(),
    );
    return { message };
  }

  @Patch("support/threads/:id/read")
  @ApiOperation({ summary: "Admin đánh dấu đã đọc hội thoại" })
  async markSupportRead(
    @CurrentUser() user: AuthUserPayload,
    @Param("id", ParseIntPipe) id: number,
  ) {
    await this.supportChat.markRead(id, user.id, Role.ADMIN);
    return { ok: true };
  }
}
