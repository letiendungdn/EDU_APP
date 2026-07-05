import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@app/prisma";

function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

function firstReading(reading: string | null | undefined): string {
  if (!reading?.trim()) return "";
  const first = reading.split(/[、・,.\s]+/)[0]?.trim() ?? "";
  return katakanaToHiragana(first.split(".")[0] ?? first);
}

function hasKanji(text: string): boolean {
  return /[一-龯]/.test(text);
}

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

  async resolveReading(text: string): Promise<{ kana: string; romaji: string }> {
    const trimmed = text.trim();
    if (!trimmed) return { kana: "", romaji: "" };

    if (!hasKanji(trimmed)) {
      const kana = katakanaToHiragana(trimmed);
      return { kana, romaji: this.toRomaji(kana) };
    }

    const vocab = await this.prisma.vocabulary.findFirst({
      where: {
        OR: [{ kanji: trimmed }, { kana: trimmed }],
      },
      select: { kana: true, romaji: true },
      orderBy: { id: "asc" },
    });
    if (vocab) {
      const kana = katakanaToHiragana(vocab.kana);
      return {
        kana,
        romaji: vocab.romaji?.trim() || this.toRomaji(kana),
      };
    }

    const chars = [...trimmed].filter((ch) => /[一-龯]/.test(ch));

    if (chars.length === 1) {
      const entry = await this.prisma.kanjiEntry.findFirst({
        where: { character: chars[0] },
        select: { onyomi: true, kunyomi: true },
      });
      if (entry) {
        const kana =
          firstReading(entry.onyomi) || firstReading(entry.kunyomi);
        if (kana) {
          return { kana, romaji: this.toRomaji(kana) };
        }
      }
    }

    if (chars.length > 1) {
      const entries = await this.prisma.kanjiEntry.findMany({
        where: { character: { in: chars } },
        select: { character: true, onyomi: true, kunyomi: true },
      });
      const byChar = new Map(entries.map((e) => [e.character, e]));
      let kana = "";
      for (const ch of chars) {
        const entry = byChar.get(ch);
        if (!entry) {
          kana = "";
          break;
        }
        const part = firstReading(entry.onyomi);
        if (!part) {
          kana = "";
          break;
        }
        kana += part;
      }
      if (kana) {
        return { kana, romaji: this.toRomaji(kana) };
      }
    }

    return { kana: trimmed, romaji: this.toRomaji(trimmed) };
  }
}
