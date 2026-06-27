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
  CreateGrammarDto,
  LessonPaginationDto,
  UpdateGrammarDto,
} from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('grammars')
@Controller('api/grammars')
export class GrammarsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create grammar entry' })
  create(@Body() dto: CreateGrammarDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.CREATE_GRAMMAR, dto),
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List grammars, optionally by lesson' })
  findAll(@Query() query: LessonPaginationDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_GRAMMARS, {
        lessonNumber: query.lessonNumber,
        page: query.page ?? 1,
        limit: query.limit ?? 50,
      }),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get grammar by id' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_GRAMMAR, { id: +id }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grammar entry' })
  update(@Param('id') id: string, @Body() dto: UpdateGrammarDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.UPDATE_GRAMMAR, {
        id: +id,
        dto,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grammar' })
  remove(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.DELETE_GRAMMAR, { id: +id }),
    );
  }
}
