import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  EXAM_PROTO_PATH,
  GRPC_DEFAULT_PORTS,
  GRPC_PACKAGES,
} from '@app/contracts';
import { ExamModule } from './exam.module';
import { RpcHttpExceptionFilter } from './filters/rpc-http-exception.filter';

async function bootstrap() {
  const port = process.env.EXAM_GRPC_PORT ?? GRPC_DEFAULT_PORTS.exam;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ExamModule,
    {
      transport: Transport.GRPC,
      options: {
        package: GRPC_PACKAGES.exam,
        protoPath: EXAM_PROTO_PATH,
        url: `0.0.0.0:${port}`,
      },
    },
  );
  app.useGlobalFilters(new RpcHttpExceptionFilter());
  await app.listen();
  console.log(`Exam service listening on gRPC :${port}`);
}

void bootstrap();
