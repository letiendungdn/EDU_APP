export interface LangEntry {
  text: string;
  pronunciation: string;
}

export interface JaEntry {
  text: string;
  kana: string;
  romaji: string;
}

export interface TranslationResult {
  detected: 'vi' | 'en' | 'ja';
  vi: LangEntry;
  en: LangEntry;
  ja: JaEntry;
  examples: Array<{ vi: string; en: string; ja: string }>;
}

export type BgMessage = { type: 'TRANSLATE'; text: string };

export type BgResponse =
  | { success: true; result: TranslationResult }
  | { success: false; error: string };
