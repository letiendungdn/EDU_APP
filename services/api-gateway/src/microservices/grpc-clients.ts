import { Inject, Injectable } from '@nestjs/common';
import { GrpcDispatchClient } from '@app/common';

@Injectable()
export class ContentGrpcClient extends GrpcDispatchClient {
  constructor(@Inject('CONTENT_SERVICE_GRPC') grpcClient: object) {
    super(grpcClient as ConstructorParameters<typeof GrpcDispatchClient>[0], 'ContentService');
  }
}

@Injectable()
export class ExamGrpcClient extends GrpcDispatchClient {
  constructor(@Inject('EXAM_SERVICE_GRPC') grpcClient: object) {
    super(grpcClient as ConstructorParameters<typeof GrpcDispatchClient>[0], 'ExamService');
  }
}
