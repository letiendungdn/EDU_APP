import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { KafkaTopics } from "@app/contracts";
import { KafkaProducerService } from "../../../kafka/kafka.producer";
import { ExamSubmittedEvent } from "./exam-submitted.event";

@EventsHandler(ExamSubmittedEvent)
export class ExamSubmittedHandler implements IEventHandler<ExamSubmittedEvent> {
  private readonly logger = new Logger(ExamSubmittedHandler.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async handle(event: ExamSubmittedEvent) {
    try {
      await this.kafkaProducer.emit(
        KafkaTopics.EXAM_SUBMITTED,
        event.payload as unknown as Record<string, unknown>,
      );
      this.logger.log(
        `Emitted ${KafkaTopics.EXAM_SUBMITTED}: examId=${event.payload.examId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit ${KafkaTopics.EXAM_SUBMITTED}: ${String(error)}`,
      );
    }
  }
}
