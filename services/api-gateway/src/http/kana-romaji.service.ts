import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@app/prisma";

type VocabMatch = {
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
};

/** Cụm thông dụng (thường không có trong bảng Vocabulary Minna). */
const PHRASE_MEANINGS: Record<string, { meaning: string; kanji?: string }> = {
  ありがとう: { meaning: "Cảm ơn", kanji: "有難う" },
  ありがとうございます: { meaning: "Cảm ơn (lịch sự)" },
  どうもありがとうございます: { meaning: "Cảm ơn nhiều (lịch sự)" },
  よろしく: { meaning: "Rất hân hạnh (khi làm quen)" },
  よろしくおねがいします: { meaning: "Rất mong được giúp đỡ" },
  どうぞよろしく: { meaning: "Rất hân hạnh (xin nhận)" },
  どうぞ: { meaning: "Xin mời / Xin hãy" },
  おねがいします: { meaning: "Làm ơn / Nhờ bạn" },
  おはよう: { meaning: "Chào buổi sáng" },
  おはようございます: { meaning: "Chào buổi sáng (lịch sự)" },
  こんにちは: { meaning: "Xin chào (ban ngày)" },
  こんばんは: { meaning: "Chào buổi tối" },
  さようなら: { meaning: "Tạm biệt" },
  すみません: { meaning: "Xin lỗi / Excuse me" },
  ごめんなさい: { meaning: "Xin lỗi (lịch sự)" },
  日本語: { meaning: "Tiếng Nhật" },
};

function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

function normalizeKana(text: string): string {
  return katakanaToHiragana(text).replace(/\s+/g, "").trim();
}

function normalizeRomaji(text: string): string {
  return text.toLowerCase().replace(/[\s-]+/g, "");
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
  private reverseMap = new Map<string, string>();
  private reverseRomajiKeys: string[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.reload();
  }

  async reload() {
    const rows = await this.prisma.kanaRomaji.findMany({
      select: { kana: true, romaji: true },
    });
    this.map = new Map(rows.map((r) => [r.kana, r.romaji]));
    this.reverseMap = new Map();
    for (const row of rows) {
      const key = normalizeRomaji(row.romaji);
      if (key && !this.reverseMap.has(key)) {
        this.reverseMap.set(key, row.kana);
      }
    }
    this.reverseRomajiKeys = [...this.reverseMap.keys()].sort(
      (a, b) => b.length - a.length,
    );
    this.logger.log(`Loaded ${this.map.size} kana→romaji entries`);
  }

  romajiToKana(romaji: string): string {
    const input = normalizeRomaji(romaji);
    if (!input || !this.reverseRomajiKeys.length) return "";

    let i = 0;
    let result = "";

    while (i < input.length) {
      if (
        i + 1 < input.length &&
        input[i] === input[i + 1] &&
        !"aeiouy".includes(input[i]) &&
        input[i] !== "n"
      ) {
        result += "っ";
        i += 1;
        continue;
      }

      if (
        input[i] === "n" &&
        (i === input.length - 1 || !"aeiouy".includes(input[i + 1]))
      ) {
        result += "ん";
        i += 1;
        continue;
      }

      let matched = false;
      for (const key of this.reverseRomajiKeys) {
        if (input.startsWith(key, i)) {
          result += this.reverseMap.get(key) ?? "";
          i += key.length;
          matched = true;
          break;
        }
      }

      if (!matched) return "";
    }

    return katakanaToHiragana(result);
  }

  async resolveFromRomaji(romaji: string): Promise<{
    romaji: string;
    kana: string;
    kanji: string | null;
    meaning: string | null;
    options: Array<{ kind: "kana" | "kanji"; text: string }>;
  }> {
    const trimmed = romaji.trim();
    const normalized = normalizeRomaji(trimmed);
    if (!normalized) {
      return { romaji: trimmed, kana: "", kanji: null, meaning: null, options: [] };
    }

    const vocab = await this.prisma.vocabulary.findFirst({
      where: { romaji: { equals: normalized, mode: "insensitive" } },
      select: { kanji: true, kana: true, romaji: true, meaning: true },
      orderBy: { id: "asc" },
    });

    if (vocab) {
      return this.buildRomajiResolution(
        trimmed,
        normalizeKana(vocab.kana),
        vocab.kanji,
        vocab.meaning,
      );
    }

    const kanaFromMap = this.romajiToKana(normalized);
    if (kanaFromMap) {
      const phrase = PHRASE_MEANINGS[kanaFromMap];
      if (phrase) {
        return this.buildRomajiResolution(
          trimmed,
          kanaFromMap,
          phrase.kanji ?? null,
          phrase.meaning,
        );
      }

      const vocabByKana = await this.findVocabulary(kanaFromMap);
      if (vocabByKana) {
        return this.buildRomajiResolution(
          trimmed,
          normalizeKana(vocabByKana.kana),
          vocabByKana.kanji,
          vocabByKana.meaning,
        );
      }

      return this.buildRomajiResolution(trimmed, kanaFromMap, null, null);
    }

    return { romaji: trimmed, kana: "", kanji: null, meaning: null, options: [] };
  }

  private buildRomajiResolution(
    romaji: string,
    kana: string,
    kanji: string | null | undefined,
    meaning: string | null | undefined,
  ) {
    const options: Array<{ kind: "kana" | "kanji"; text: string }> = [];
    if (kana) options.push({ kind: "kana", text: kana });
    if (kanji && kanji !== kana) options.push({ kind: "kanji", text: kanji });

    return {
      romaji,
      kana,
      kanji: kanji ?? null,
      meaning: meaning ?? null,
      options,
    };
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

  async resolveReading(text: string): Promise<{
    kana: string;
    romaji: string;
    kanji?: string | null;
    meaning?: string | null;
  }> {
    const trimmed = text.trim();
    if (!trimmed) return { kana: "", romaji: "" };

    const vocab = await this.findVocabulary(trimmed);

    if (!hasKanji(trimmed)) {
      const kana = katakanaToHiragana(trimmed);
      const resolvedKana = vocab ? katakanaToHiragana(vocab.kana) : kana;
      return {
        kana: resolvedKana,
        romaji: vocab?.romaji?.trim() || this.toRomaji(resolvedKana),
        kanji: vocab?.kanji ?? null,
        meaning: vocab?.meaning ?? null,
      };
    }

    if (vocab) {
      const kana = katakanaToHiragana(vocab.kana);
      return {
        kana,
        romaji: vocab.romaji?.trim() || this.toRomaji(kana),
        kanji: vocab.kanji,
        meaning: vocab.meaning,
      };
    }

    const chars = [...trimmed].filter((ch) => /[一-龯]/.test(ch));

    if (chars.length === 1) {
      const entry = await this.prisma.kanjiEntry.findFirst({
        where: { character: chars[0] },
        select: { onyomi: true, kunyomi: true, meaningVi: true },
      });
      if (entry) {
        const kana =
          firstReading(entry.onyomi) || firstReading(entry.kunyomi);
        if (kana) {
          return {
            kana,
            romaji: this.toRomaji(kana),
            kanji: trimmed,
            meaning: entry.meaningVi ?? null,
          };
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
        const meaning = await this.resolveMeaningForKanji(trimmed);
        return {
          kana,
          romaji: this.toRomaji(kana),
          kanji: trimmed,
          meaning,
        };
      }
    }

    const phrase = this.findPhraseMeaning(normalizeKana(trimmed));
    return {
      kana: trimmed,
      romaji: this.toRomaji(trimmed),
      kanji: phrase?.kanji ?? trimmed,
      meaning: phrase?.meaning ?? null,
    };
  }

  private stripLookupMarkers(text: string): string {
    return text.replace(/[\[［\]］]/g, "").trim();
  }

  private findPhraseMeaning(normalizedKana: string) {
    if (!normalizedKana) return null;

    const exact = PHRASE_MEANINGS[normalizedKana];
    if (exact) return exact;

    for (const [key, value] of Object.entries(PHRASE_MEANINGS)) {
      if (normalizedKana.endsWith(key) && key.length >= 3) {
        return value;
      }
    }

    return null;
  }

  private phraseAsVocab(normalizedKana: string): VocabMatch | null {
    const phrase = this.findPhraseMeaning(normalizedKana);
    if (!phrase) return null;

    return {
      kanji: phrase.kanji ?? null,
      kana: normalizedKana,
      romaji: this.toRomaji(normalizedKana),
      meaning: phrase.meaning,
    };
  }

  private async resolveMeaningForKanji(text: string): Promise<string | null> {
    const stripped = this.stripLookupMarkers(text);
    const queries = [...new Set([text, stripped].filter(Boolean))];

    for (const q of queries) {
      const vocab = await this.prisma.vocabulary.findFirst({
        where: { kanji: q },
        select: { meaning: true },
        orderBy: { id: "asc" },
      });
      if (vocab?.meaning) return vocab.meaning;

      const kanjiVocab = await this.prisma.kanjiVocab.findFirst({
        where: { word: q },
        select: { meaningVi: true },
        orderBy: { id: "asc" },
      });
      if (kanjiVocab?.meaningVi) return kanjiVocab.meaningVi;
    }

    const phrase = PHRASE_MEANINGS[stripped] ?? PHRASE_MEANINGS[text];
    return phrase?.meaning ?? null;
  }

  private async findVocabulary(text: string): Promise<VocabMatch | null> {
    const trimmed = text.trim();
    const hiragana = katakanaToHiragana(trimmed);
    const stripped = this.stripLookupMarkers(trimmed);
    const strippedHira = normalizeKana(stripped);
    const queries = [...new Set([trimmed, hiragana, stripped, strippedHira].filter(Boolean))];

    for (const q of queries) {
      const exact = await this.prisma.vocabulary.findFirst({
        where: { OR: [{ kanji: q }, { kana: q }] },
        select: { kanji: true, kana: true, romaji: true, meaning: true },
        orderBy: { id: "asc" },
      });
      if (exact) return exact;
    }

    if (strippedHira.length >= 2 && !hasKanji(trimmed)) {
      const romajiGuess = normalizeRomaji(this.toRomaji(strippedHira));
      if (romajiGuess) {
        const byRomaji = await this.prisma.vocabulary.findFirst({
          where: { romaji: { equals: romajiGuess, mode: "insensitive" } },
          select: { kanji: true, kana: true, romaji: true, meaning: true },
          orderBy: { id: "asc" },
        });
        if (byRomaji) return byRomaji;
      }

      const prefix = strippedHira.slice(0, Math.min(4, strippedHira.length));
      const candidates = await this.prisma.vocabulary.findMany({
        where: { kana: { startsWith: prefix } },
        select: { kanji: true, kana: true, romaji: true, meaning: true },
        take: 120,
        orderBy: { kana: "asc" },
      });
      const normalizedMatch = candidates.find(
        (row) => normalizeKana(row.kana) === strippedHira,
      );
      if (normalizedMatch) return normalizedMatch;

      const kanjiVocab = await this.prisma.kanjiVocab.findFirst({
        where: {
          OR: [{ reading: strippedHira }, { reading: hiragana }, { word: stripped }],
        },
        select: { word: true, reading: true, meaningVi: true },
        orderBy: { id: "asc" },
      });
      if (kanjiVocab) {
        return {
          kanji: kanjiVocab.word,
          kana: normalizeKana(kanjiVocab.reading),
          romaji: this.toRomaji(kanjiVocab.reading),
          meaning: kanjiVocab.meaningVi,
        };
      }

      const phrase = this.phraseAsVocab(strippedHira);
      if (phrase) return phrase;
    }

    if (hasKanji(trimmed)) {
      for (const q of [trimmed, stripped]) {
        const vocabByKanji = await this.prisma.vocabulary.findFirst({
          where: { kanji: q },
          select: { kanji: true, kana: true, romaji: true, meaning: true },
          orderBy: { id: "asc" },
        });
        if (vocabByKanji) return vocabByKanji;

        const kanjiVocab = await this.prisma.kanjiVocab.findFirst({
          where: { word: q },
          select: { word: true, reading: true, meaningVi: true },
          orderBy: { id: "asc" },
        });
        if (kanjiVocab) {
          return {
            kanji: kanjiVocab.word,
            kana: normalizeKana(kanjiVocab.reading),
            romaji: this.toRomaji(kanjiVocab.reading),
            meaning: kanjiVocab.meaningVi,
          };
        }
      }

      const kanjiOnly = [...trimmed].filter((ch) => /[一-龯]/.test(ch)).join("");
      if (kanjiOnly.length >= 1) {
        const prefixMatch = await this.prisma.vocabulary.findFirst({
          where: { kanji: kanjiOnly },
          select: { kanji: true, kana: true, romaji: true, meaning: true },
          orderBy: { id: "asc" },
        });
        if (prefixMatch) return prefixMatch;
      }

      const phrase = this.phraseAsVocab(normalizeKana(stripped));
      if (phrase) return phrase;
    }

    return null;
  }
}
