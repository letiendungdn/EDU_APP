"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPC_DEFAULT_PORTS = exports.GRPC_PACKAGES = exports.EXAM_PROTO_PATH = exports.CONTENT_PROTO_PATH = void 0;
const path_1 = require("path");
const protoDir = (0, path_1.join)(__dirname, '../proto');
exports.CONTENT_PROTO_PATH = (0, path_1.join)(protoDir, 'content.proto');
exports.EXAM_PROTO_PATH = (0, path_1.join)(protoDir, 'exam.proto');
exports.GRPC_PACKAGES = {
    content: 'nihongo.content',
    exam: 'nihongo.exam',
};
exports.GRPC_DEFAULT_PORTS = {
    content: 50051,
    exam: 50052,
};
//# sourceMappingURL=grpc-paths.js.map