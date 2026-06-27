import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@app/common';
import { PrismaModule } from '@app/prisma';
import { LessonsModule } from './modules/lessons/lessons.module';
import { VocabulariesModule } from './modules/vocabularies/vocabularies.module';
import { GrammarsModule } from './modules/grammars/grammars.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { KanjiModule } from './modules/kanji/kanji.module';
import { ListeningModule } from './modules/listening/listening.module';
import { ImportModule } from './modules/import/import.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { ReadingModule } from './modules/reading/reading.module';
import { ContentMsController } from './content.ms.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    LessonsModule,
    VocabulariesModule,
    GrammarsModule,
    ExercisesModule,
    KanjiModule,
    ListeningModule,
    ImportModule,
    ReferenceModule,
    ReadingModule,
  ],
  controllers: [ContentMsController],
})
export class ContentModule {}
