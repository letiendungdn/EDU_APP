// jose chỉ có bản ESM — Jest (CommonJS) không parse được. E2E đăng ký/đăng nhập dùng JWT local, không gọi OIDC.
jest.mock("jose", () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

// Jest 30 từ chối require module mới trong beforeAll. Nạp gRPC lúc setup để Nest dùng cache.
require("@grpc/grpc-js");
require("@grpc/proto-loader");
