import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('kanji')
@Controller('api')
export class KanjiController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Get('kanji-lessons')
  @Public()
  @ApiOperation({ summary: 'List kanji lessons' })
  findAllLessons() {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_LESSONS, {}),
    );
  }

  @Get('kanji')
  @Public()
  @ApiOperation({ summary: 'List kanji entries' })
  findEntries(@Query('lessonNumber') lessonNumber?: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_ENTRIES, {
        lessonNumber: lessonNumber ? +lessonNumber : undefined,
      }),
    );
  }

  @Get('kanji/:id')
  @Public()
  @ApiOperation({ summary: 'Get kanji entry by id' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_ENTRY, { id: +id }),
    );
  }
}
