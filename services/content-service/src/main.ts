import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  CONTENT_PROTO_PATH,
  GRPC_DEFAULT_PORTS,
  GRPC_PACKAGES,
} from '@app/contracts';
import { ContentModule } from './content.module';

async function bootstrap() {
  const port = process.env.CONTENT_GRPC_PORT ?? GRPC_DEFAULT_PORTS.content;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ContentModule,
    {
      transport: Transport.GRPC,
      options: {
        package: GRPC_PACKAGES.content,
        protoPath: CONTENT_PROTO_PATH,
        url: `0.0.0.0:${port}`,
      },
    },
  );
  await app.listen();
  console.log(`Content service listening on gRPC :${port}`);
}

void bootstrap();
