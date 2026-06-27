export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: { url: process.env.DATABASE_URL },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
  grpc: {
    contentUrl: process.env.CONTENT_GRPC_URL ?? 'localhost:50051',
    examUrl: process.env.EXAM_GRPC_URL ?? 'localhost:50052',
  },
  cors: {
    origins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(
      ',',
    ),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});
