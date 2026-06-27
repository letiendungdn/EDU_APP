import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';

@ApiTags('import')
@Controller('api/import')
export class ImportController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post('vocab')
  @ApiOperation({ summary: 'Import vocabulary from tab-separated text' })
  importVocab(@Body() body: { lessonNumber: number; text: string }) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.IMPORT_VOCAB, body),
    );
  }
}
