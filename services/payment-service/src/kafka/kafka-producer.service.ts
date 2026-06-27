import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const brokers = (
      this.configService.get<string>("kafka.brokers") ??
      process.env.KAFKA_BROKERS ??
      "localhost:9092"
    ).split(",");

    const kafka = new Kafka({
      clientId: "payment-service",
      brokers,
    });

    this.producer = kafka.producer();
    try {
      await this.producer.connect();
      this.logger.log(`Kafka producer connected to ${brokers.join(", ")}`);
    } catch (error) {
      this.logger.warn(
        `Kafka producer connection failed — events will be skipped: ${String(error)}`,
      );
      this.producer = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async emit(topic: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.producer) return;

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
