import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { SubmitExamCommand } from "./submit-exam.command";
import { MockExamsService } from "../mock-exams.service";
import { ExamSubmittedEvent } from "../events/exam-submitted.event";

@CommandHandler(SubmitExamCommand)
export class SubmitExamHandler implements ICommandHandler<SubmitExamCommand> {
  constructor(
    private readonly mockExamsService: MockExamsService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SubmitExamCommand) {
    const result = await this.mockExamsService.submit(
      command.examId,
      command.answers,
      command.userId,
    );

    this.eventBus.publish(
      new ExamSubmittedEvent({
        examId: result.examId,
        userId: command.userId,
        level: result.level,
        percent: result.percent,
        passed: result.passed,
        correctCount: result.correctCount,
        total: result.total,
        submittedAt: result.submittedAt,
      }),
    );

    return result;
  }
}
