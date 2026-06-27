import { Module } from "@nestjs/common";
import { PaymentModule } from "../../../payment-service/src/payment.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PaymentModule, RealtimeModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
