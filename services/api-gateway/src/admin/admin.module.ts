import { Module } from "@nestjs/common";
import { PaymentModule } from "../../../payment-service/src/payment.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { EmailTemplateModule } from "../email-template/email-template.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PaymentModule, RealtimeModule, EmailTemplateModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
