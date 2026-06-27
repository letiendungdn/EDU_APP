import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/common';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard thống kê (admin only)' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Danh sách users kèm số bài thi' })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('import/vocab')
  @ApiOperation({ summary: 'Import từ vựng từ text tab-separated' })
  importVocab(@Body() body: { lessonNumber: number; text: string }) {
    return this.adminService.importVocab(body.lessonNumber, body.text);
  }
}
