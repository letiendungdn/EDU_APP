import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MockExamsService } from "./mock-exams.service";
import { SubmitExamHandler } from "./commands/submit-exam.handler";
import { GetExamHandler } from "./queries/get-exam.handler";
import { GetResultsHandler } from "./queries/get-results.handler";
import { ExamSubmittedHandler } from "./events/exam-submitted.handler";

@Module({
  imports: [CqrsModule],
  providers: [
    MockExamsService,
    SubmitExamHandler,
    GetExamHandler,
    GetResultsHandler,
    ExamSubmittedHandler,
  ],
  exports: [MockExamsService],
})
export class MockExamsModule {}
