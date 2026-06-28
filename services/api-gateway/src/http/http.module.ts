import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { LessonsController } from "./lessons.controller";
import { VocabulariesController } from "./vocabularies.controller";
import { GrammarsController } from "./grammars.controller";
import { ExercisesController } from "./exercises.controller";
import { KanjiController } from "./kanji.controller";
import { ListeningController } from "./listening.controller";
import { MockExamsController } from "./mock-exams.controller";
import { ProgressController } from "./progress.controller";
import { ImportController } from "./import.controller";
import { JlptScheduleController } from "./jlpt-schedule.controller";
import { JlptScheduleService } from "./jlpt-schedule.service";
import { ReferenceController } from "./reference.controller";
import { ReadingController } from "./reading.controller";
import { DictationController } from "./dictation.controller";
import { AnalyticsController } from "./analytics.controller";
import { SubscriptionController } from "./subscription.controller";
import { PaymentsController } from "./payments.controller";
import { PaymentMethodsController } from "./payment-methods.controller";
import { MarketplaceController } from "./marketplace.controller";
import { CoachController } from "./coach.controller";
import { UploadController } from "./upload/upload.controller";
import { UploadService } from "./upload/upload.service";
import { PaymentModule } from "../../../payment-service/src/payment.module";
import { EnglishModule } from "../../../english-service/src/english.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { isEnglishEnabled } from "@app/common";
import { NotificationController } from "./notification.controller";
import { SupportController } from "./support.controller";
import { CommunityController } from "./community.controller";

const httpImports: Array<Type | DynamicModule> = [
  PaymentModule,
  ...(isEnglishEnabled() ? [EnglishModule] : []),
  RealtimeModule,
];

@Module({
  imports: httpImports,
  controllers: [
    LessonsController,
    VocabulariesController,
    GrammarsController,
    ExercisesController,
    KanjiController,
    ListeningController,
    MockExamsController,
    ProgressController,
    ImportController,
    JlptScheduleController,
    ReferenceController,
    ReadingController,
    DictationController,
    AnalyticsController,
    SubscriptionController,
    PaymentsController,
    PaymentMethodsController,
    MarketplaceController,
    CoachController,
    UploadController,
    NotificationController,
    SupportController,
    CommunityController,
  ],
  providers: [JlptScheduleService, UploadService],
})
export class HttpModule {}
