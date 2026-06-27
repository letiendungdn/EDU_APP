import { Module } from '@nestjs/common';
import { KanjiService } from './kanji.service';

@Module({
  providers: [KanjiService],
  exports: [KanjiService],
})
export class KanjiModule {}
