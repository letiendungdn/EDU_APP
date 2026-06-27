import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';
import { Public, type AuthUserPayload } from '@app/common';

@ApiTags('reading')
@Controller('api/reading')
export class ReadingController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List reading passages' })
  findAll(@Query('jlptLevel') jlptLevel?: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_READING_PASSAGES, {
        jlptLevel,
      }),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get reading passage with questions' })
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_READING_PASSAGE, {
        id: +id,
      }),
    );
  }

  @Post(':id/submit')
  @Public()
  @ApiOperation({ summary: 'Submit reading answers' })
  submit(
    @Param('id') id: string,
    @Body() body: { answers: Record<string, string> },
    @Req() req: { user?: AuthUserPayload | null },
  ) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.SUBMIT_READING, {
        passageId: +id,
        answers: body.answers,
        userId: req.user?.id ?? null,
      }),
    );
  }
}
