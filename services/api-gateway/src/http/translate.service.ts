import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private readonly cache = new Map<string, string>();

  async translate(
    text: string,
    sourceLang = "ja",
    targetLang = "vi",
  ): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return "";

    const cacheKey = `${sourceLang}|${targetLang}|${trimmed}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const langPair = `${sourceLang}|${targetLang}`;
    const url =
      "https://api.mymemory.translated.net/get?" +
      new URLSearchParams({ q: trimmed, langpair: langPair }).toString();

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Translate upstream HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      responseData?: { translatedText?: string };
    };

    const translated = json.responseData?.translatedText?.trim() ?? trimmed;
    this.cache.set(cacheKey, translated);
    if (this.cache.size > 500) {
      const first = this.cache.keys().next().value;
      if (first) this.cache.delete(first);
    }

    this.logger.debug(`Translated (${langPair}): ${trimmed.slice(0, 40)}…`);
    return translated;
  }
}
