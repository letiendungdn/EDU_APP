import "@grpc/grpc-js";
import "@grpc/proto-loader";

process.env.STRIPE_SECRET_KEY ??= "sk_test_ci";
process.env.GEMINI_API_KEY ??= "test-key";
// Client English trong repo được generate trên Windows — CI (Linux) không có query engine đó.
process.env.ENGLISH_ENABLED ??= "false";

// jose chỉ có bản ESM — Jest (CommonJS) không parse được. E2E đăng ký/đăng nhập dùng JWT local, không gọi OIDC.
jest.mock("jose", () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));
