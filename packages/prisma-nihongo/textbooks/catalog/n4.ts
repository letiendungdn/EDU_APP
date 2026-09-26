import type { TbLevelCatalog } from '../types';
import { N4_CATEGORIES, N4_GRAMMAR } from './n4-grammar';
import { N4_TOPICS } from './n4-vocab';
import { N4_KANJI } from './n4-kanji';

export const N4_CATALOG: TbLevelCatalog = {
  level: 'N4',
  categories: N4_CATEGORIES,
  grammar: N4_GRAMMAR,
  topics: N4_TOPICS,
  kanji: N4_KANJI,
};
