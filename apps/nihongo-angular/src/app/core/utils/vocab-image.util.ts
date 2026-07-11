import { hasVocabImage, resolveVocabImage } from '@edu/vocab-images';
import type { Vocabulary } from '../models/api.models';

export type PictureVocabInput = Pick<
  Vocabulary,
  'kana' | 'kanji' | 'romaji' | 'meaning' | 'imageUrl'
>;

export function resolvePictureVocabImage(v: PictureVocabInput): string | null {
  return resolveVocabImage({
    word: v.romaji,
    meaning: v.meaning,
    kana: v.kana,
    kanji: v.kanji,
    imageUrl: v.imageUrl,
  });
}

export function hasPictureVocabImage(v: PictureVocabInput): boolean {
  return hasVocabImage({
    word: v.romaji,
    meaning: v.meaning,
    kana: v.kana,
    kanji: v.kanji,
    imageUrl: v.imageUrl,
  });
}
