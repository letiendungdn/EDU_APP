import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { redisStore } from "cache-manager-redis-yet";
import { configuration, RedisModule } from "@app/common";
import { PrismaModule } from "@app/prisma";
import { MockExamsModule } from "./modules/mock-exams/mock-exams.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { ExamMsController } from "./exam.ms.controller";
import { KafkaModule } from "./kafka/kafka.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get<string>("redis.url"),
        }),
        ttl: 3 * 60 * 60 * 1000,
      }),
    }),
    CqrsModule,
    KafkaModule,
    PrismaModule,
    MockExamsModule,
    ProgressModule,
  ],
  controllers: [ExamMsController],
})
export class ExamModule {}
