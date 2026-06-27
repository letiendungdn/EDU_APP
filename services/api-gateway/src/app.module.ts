import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import {
  PrometheusModule,
  makeCounterProvider,
} from "@willsoto/nestjs-prometheus";
import {
  AuditInterceptor,
  AuditModule,
  configuration,
  JwtAuthGuard,
  pinoConfig,
  RedisModule,
} from "@app/common";
import { PrismaModule } from "@app/prisma";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { MicroservicesModule } from "./microservices/microservices.module";
import { HealthModule } from "./health/health.module";
import { HttpModule } from "./http/http.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { HttpMetricsInterceptor } from "./metrics/http-metrics.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>("mongodb.url") ??
          process.env.MONGODB_URL ??
          "mongodb://localhost:27017/nihongo_audit",
      }),
    }),
    LoggerModule.forRoot(pinoConfig),
    PrometheusModule.register({
      path: "/metrics",
      defaultMetrics: { enabled: true },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    RedisModule,
    AuditModule,
    MicroservicesModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    HealthModule,
    RealtimeModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    makeCounterProvider({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "path", "status"],
    }),
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
