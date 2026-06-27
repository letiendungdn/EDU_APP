import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CONTENT_PROTO_PATH,
  EXAM_PROTO_PATH,
  GRPC_PACKAGES,
} from '@app/contracts';
import { ContentGrpcClient, ExamGrpcClient } from './grpc-clients';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CONTENT_SERVICE_GRPC',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGES.content,
            protoPath: CONTENT_PROTO_PATH,
            url: config.get<string>('grpc.contentUrl') ?? 'localhost:50051',
          },
        }),
      },
      {
        name: 'EXAM_SERVICE_GRPC',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGES.exam,
            protoPath: EXAM_PROTO_PATH,
            url: config.get<string>('grpc.examUrl') ?? 'localhost:50052',
          },
        }),
      },
    ]),
  ],
  providers: [
    ContentGrpcClient,
    ExamGrpcClient,
    { provide: 'CONTENT_SERVICE', useExisting: ContentGrpcClient },
    { provide: 'EXAM_SERVICE', useExisting: ExamGrpcClient },
  ],
  exports: ['CONTENT_SERVICE', 'EXAM_SERVICE'],
})
export class MicroservicesModule {}
