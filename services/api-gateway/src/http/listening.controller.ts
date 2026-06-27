import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('listening')
@Controller('api/listening')
export class ListeningController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Get('playlist')
  @Public()
  @ApiOperation({ summary: 'Get listening playlist' })
  getPlaylist(
    @Query('lessonFrom') lessonFrom = '1',
    @Query('lessonTo') lessonTo = '25',
    @Query('limit') limit = '120',
  ) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_LISTENING_PLAYLIST, {
        lessonFrom: +lessonFrom,
        lessonTo: +lessonTo,
        limit: +limit,
      }),
    );
  }
}
