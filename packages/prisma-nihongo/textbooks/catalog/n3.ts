import type { TbLevelCatalog } from '../types';
import { N3_CATEGORIES, N3_GRAMMAR } from './n3-grammar';
import { N3_TOPICS } from './n3-vocab';
import { N3_KANJI } from './n3-kanji';

export const N3_CATALOG: TbLevelCatalog = {
  level: 'N3',
  categories: N3_CATEGORIES,
  grammar: N3_GRAMMAR,
  topics: N3_TOPICS,
  kanji: N3_KANJI,
};
