import type { TbLevelCatalog } from '../types';
import { N5_CATEGORIES, N5_GRAMMAR } from './n5-grammar';
import { N5_TOPICS } from './n5-vocab';
import { N5_KANJI } from './n5-kanji';

export const N5_CATALOG: TbLevelCatalog = {
  level: 'N5',
  categories: N5_CATEGORIES,
  grammar: N5_GRAMMAR,
  topics: N5_TOPICS,
  kanji: N5_KANJI,
};
