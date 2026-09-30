import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MockExamsService } from "./mock-exams.service";
import { SubmitExamHandler } from "./commands/submit-exam.handler";
import { GetExamHandler } from "./queries/get-exam.handler";
import { GetResultsHandler } from "./queries/get-results.handler";

@Module({
  imports: [CqrsModule],
  providers: [
    MockExamsService,
    SubmitExamHandler,
    GetExamHandler,
    GetResultsHandler,
  ],
  exports: [MockExamsService],
})
export class MockExamsModule {}
