export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: { url: process.env.DATABASE_URL },
  englishDatabase: {
    url:
      process.env.ENGLISH_DATABASE_URL ??
      'postgresql://english:english@localhost:5434/english_learning',
  },
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
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS ?? 'localhost:9092',
  },
  mongodb: {
    url: process.env.MONGODB_URL ?? 'mongodb://localhost:27017/nihongo_audit',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET ?? 'edu-app-dev',
  },
});
