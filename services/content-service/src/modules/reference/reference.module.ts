import { Module } from "@nestjs/common";
import { ReferenceService } from "./reference.service";
import { VocabSuffixesService } from "./vocab-suffixes.service";

@Module({
  providers: [ReferenceService, VocabSuffixesService],
  exports: [ReferenceService, VocabSuffixesService],
})
export class ReferenceModule {}
