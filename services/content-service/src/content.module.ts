import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { configuration } from "@app/common";
import { PrismaModule } from "@app/prisma";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { VocabulariesModule } from "./modules/vocabularies/vocabularies.module";
import { GrammarsModule } from "./modules/grammars/grammars.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { KanjiModule } from "./modules/kanji/kanji.module";
import { ListeningModule } from "./modules/listening/listening.module";
import { ImportModule } from "./modules/import/import.module";
import { ReferenceModule } from "./modules/reference/reference.module";
import { ReadingModule } from "./modules/reading/reading.module";
import { ContentMsController } from "./content.ms.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get<string>("redis.url"),
        }),
        ttl: 300_000,
      }),
    }),
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
