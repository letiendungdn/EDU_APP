// jose chỉ có bản ESM — Jest (CommonJS) không parse được. E2E đăng ký/đăng nhập dùng JWT local, không gọi OIDC.
jest.mock("jose", () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));
