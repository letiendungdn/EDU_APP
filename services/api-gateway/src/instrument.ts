import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Sentry chỉ để bắt lỗi. Trace do OpenTelemetry trong tracing.ts gửi sang Jaeger:
// - skipOpenTelemetrySetup: Sentry KHÔNG tự đăng ký TracerProvider toàn cục — nếu có, NodeSDK của tracing.ts
//   đăng ký thất bại ("duplicate registration of API: trace") và không trace nào tới Jaeger.
// - Không có SENTRY_DSN thì không khởi tạo gì cả.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    skipOpenTelemetrySetup: true,
  });
}
