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
  CreateVocabularyDto,
  LessonPaginationDto,
  UpdateVocabularyDto,
} from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('vocabularies')
@Controller('api/vocabularies')
export class VocabulariesController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create vocabulary entry' })
  create(@Body() dto: CreateVocabularyDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.CREATE_VOCABULARY, dto),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List vocabularies, optionally by lesson' })
  findAll(@Query() query: LessonPaginationDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_VOCABULARIES, {
        lessonNumber: query.lessonNumber,
        page: query.page ?? 1,
        limit: query.limit ?? 50,
      }),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get vocabulary by id' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_VOCABULARY, { id: +id }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vocabulary entry' })
  update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.UPDATE_VOCABULARY, {
        id: +id,
        dto,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vocabulary' })
  remove(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.DELETE_VOCABULARY, { id: +id }),
    );
  }
}
