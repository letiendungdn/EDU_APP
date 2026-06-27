import { join } from 'path';

const protoDir = join(__dirname, '../proto');

export const CONTENT_PROTO_PATH = join(protoDir, 'content.proto');
export const EXAM_PROTO_PATH = join(protoDir, 'exam.proto');

export const GRPC_PACKAGES = {
  content: 'nihongo.content',
  exam: 'nihongo.exam',
} as const;

export const GRPC_DEFAULT_PORTS = {
  content: 50051,
  exam: 50052,
} as const;
