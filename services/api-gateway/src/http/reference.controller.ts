import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';
import { Public } from '@app/common';

@ApiTags('reference')
@Controller('api/reference')
export class ReferenceController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List reference content slugs' })
  findAll() {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_REFERENCE_LIST, {}),
    );
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get reference content by slug' })
  findOne(@Param('slug') slug: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_REFERENCE, { slug }),
    );
  }
}
