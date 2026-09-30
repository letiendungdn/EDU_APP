import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** Giá trị mặc định có trong repo công khai — ai cũng tự ký được token nếu production dùng chúng. */
const KNOWN_DEFAULT_SECRETS = new Set([
  "change-me-in-production",
  "change-me",
  "secret",
  "test-secret",
  "dev-secret",
]);

const RECOMMENDED_MIN_LENGTH = 32;
const logger = new Logger("JwtSecret");

/**
 * Secret ký/kiểm tra JWT. Production (NODE_ENV=production): thiếu hoặc là giá trị mặc định
 * → KHÔNG khởi động (thà sập lúc deploy còn hơn chạy với secret ai cũng biết).
 */
export function resolveJwtSecret(config: ConfigService): string {
  const secret = config.get<string>("jwt.secret");
  const isProduction = process.env.NODE_ENV === "production";
  const fromEnv = process.env.JWT_SECRET;

  if (isProduction) {
    if (!fromEnv || !secret || KNOWN_DEFAULT_SECRETS.has(secret)) {
      throw new Error(
        "JWT_SECRET chưa được đặt hoặc đang dùng giá trị mặc định — không khởi động ở production.",
      );
    }
    if (secret.length < RECOMMENDED_MIN_LENGTH) {
      logger.warn(
        `JWT_SECRET chỉ có ${secret.length} ký tự — nên dùng ≥ ${RECOMMENDED_MIN_LENGTH} ký tự ngẫu nhiên.`,
      );
    }
    return secret;
  }

  return secret ?? "change-me-in-production";
}
