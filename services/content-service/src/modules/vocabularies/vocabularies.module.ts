import { Module } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service';

@Module({
  providers: [VocabulariesService],
  exports: [VocabulariesService],
})
export class VocabulariesModule {}
