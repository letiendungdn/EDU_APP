import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { PushController } from "./push.controller";
import { PushService } from "./push.service";
import { PushScheduler } from "./push.scheduler";

@Module({
  imports: [PrismaModule],
  controllers: [PushController],
  providers: [PushService, PushScheduler],
  exports: [PushService],
})
export class PushModule {}
