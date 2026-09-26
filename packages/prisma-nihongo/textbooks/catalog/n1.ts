import type { TbLevelCatalog } from '../types';
import { N1_CATEGORIES, N1_GRAMMAR } from './n1-grammar';
import { N1_TOPICS } from './n1-vocab';
import { N1_KANJI } from './n1-kanji';

export const N1_CATALOG: TbLevelCatalog = {
  level: 'N1',
  categories: N1_CATEGORIES,
  grammar: N1_GRAMMAR,
  topics: N1_TOPICS,
  kanji: N1_KANJI,
};
