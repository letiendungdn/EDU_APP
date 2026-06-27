import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  CONTENT_PATTERNS,
  CreateLessonDto,
  UpdateLessonDto,
} from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('lessons')
@Controller('api/lessons')
export class LessonsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a lesson' })
  create(@Body() dto: CreateLessonDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.CREATE_LESSON, dto),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all lessons' })
  findAll() {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_LESSONS, {}),
    );
  }

  @Get(':lessonNumber')
  @Public()
  @ApiOperation({ summary: 'Get lesson by number' })
  findOne(@Param('lessonNumber') lessonNumber: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_LESSON, {
        lessonNumber: +lessonNumber,
      }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.UPDATE_LESSON, { id: +id, dto }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  remove(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.DELETE_LESSON, { id: +id }),
    );
  }
}
