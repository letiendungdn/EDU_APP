import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@app/prisma";

@Injectable()
export class KanaRomajiService implements OnModuleInit {
  private readonly logger = new Logger(KanaRomajiService.name);
  private map = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.reload();
  }

  async reload() {
    const rows = await this.prisma.kanaRomaji.findMany({
      select: { kana: true, romaji: true },
    });
    this.map = new Map(rows.map((r) => [r.kana, r.romaji]));
    this.logger.log(`Loaded ${this.map.size} kana→romaji entries`);
  }

  toRomaji(text: string): string {
    let result = "";
    let i = 0;
    while (i < text.length) {
      const two = text.slice(i, i + 2);
      const combo = this.map.get(two);
      if (combo) {
        result += combo;
        i += 2;
        continue;
      }
      result += this.map.get(text[i]) ?? text[i];
      i += 1;
    }
    return result;
  }
}
