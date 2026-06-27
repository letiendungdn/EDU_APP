import { Module } from '@nestjs/common';
import { GrammarsService } from './grammars.service';

@Module({
  providers: [GrammarsService],
  exports: [GrammarsService],
})
export class GrammarsModule {}
