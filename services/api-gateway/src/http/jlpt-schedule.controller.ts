import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common';
import { JlptScheduleService } from './jlpt-schedule.service';

@ApiTags('jlpt')
@Controller('api/jlpt')
export class JlptScheduleController {
  constructor(private readonly jlptScheduleService: JlptScheduleService) {}

  @Get('da-nang/schedule')
  @Public()
  @ApiOperation({
    summary: 'Lịch thi JLPT Đà Nẵng (đồng bộ thông báo từ UFL)',
  })
  getDaNangSchedule() {
    return this.jlptScheduleService.getDaNangSchedule();
  }
}
