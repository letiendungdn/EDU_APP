import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  CONTENT_PATTERNS,
  CreateExerciseDto,
  UpdateExerciseDto,
} from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('exercises')
@Controller('api/exercises')
export class ExercisesController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create exercise' })
  create(@Body() dto: CreateExerciseDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.CREATE_EXERCISE, dto),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List exercises, optionally by lesson' })
  findAll(@Query('lessonNumber') lessonNumber?: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_EXERCISES, {
        lessonNumber: lessonNumber ? +lessonNumber : undefined,
      }),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get exercise by id' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_EXERCISE, { id: +id }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exercise' })
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.UPDATE_EXERCISE, {
        id: +id,
        dto,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise' })
  remove(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.DELETE_EXERCISE, { id: +id }),
    );
  }
}
