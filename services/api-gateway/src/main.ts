import "./instrument";
import "./tracing";
import { Logger, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";
import { AllExceptionsFilter, ResponseInterceptor } from "@app/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(PinoLogger));
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.use(cookieParser());

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }),
  );

  app.enableCors({
    origin: configService.get<string[]>("cors.origins"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Nihongo Learn API")
    .setDescription("Japanese learning app API — API Gateway")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>("port") ?? 3000;
  await app.listen(port);
  logger.log(`API Gateway: http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

void bootstrap();
