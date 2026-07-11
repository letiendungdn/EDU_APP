import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma";

const GLOBAL_KEY = "__global__";

export interface BannerConfig {
  global: string | null;
  pages: Record<string, string>;
}

function normalizePath(path: string): string {
  const base = path.split("?")[0].split("#")[0] || "/";
  const trimmed =
    base.length > 1 && base.endsWith("/") ? base.slice(0, -1) : base;
  if (!trimmed.startsWith("/")) {
    throw new BadRequestException("path phải bắt đầu bằng /");
  }
  return trimmed;
}

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<BannerConfig> {
    const rows = await this.prisma.pageBanner.findMany({
      select: { path: true, imageData: true },
    });

    const config: BannerConfig = { global: null, pages: {} };
    for (const row of rows) {
      if (row.path === GLOBAL_KEY) config.global = row.imageData;
      else config.pages[row.path] = row.imageData;
    }
    return config;
  }

  async upsert(scope: "global" | "page", path: string | undefined, image: string) {
    const key =
      scope === "global"
        ? GLOBAL_KEY
        : normalizePath(path ?? "");

    if (scope === "page" && !path) {
      throw new BadRequestException("Thiếu path cho banner theo trang");
    }

    await this.prisma.pageBanner.upsert({
      where: { path: key },
      create: { path: key, imageData: image },
      update: { imageData: image },
    });

    return this.getConfig();
  }

  async remove(scope: "global" | "page" | "all", path?: string) {
    if (scope === "all") {
      await this.prisma.pageBanner.deleteMany({});
    } else if (scope === "global") {
      await this.prisma.pageBanner.deleteMany({ where: { path: GLOBAL_KEY } });
    } else {
      if (!path) throw new BadRequestException("Thiếu path cần xóa");
      await this.prisma.pageBanner.deleteMany({
        where: { path: normalizePath(path) },
      });
    }

    return this.getConfig();
  }
}
