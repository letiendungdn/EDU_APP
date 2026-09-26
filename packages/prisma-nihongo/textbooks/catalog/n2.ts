import type { TbLevelCatalog } from '../types';
import { N2_CATEGORIES, N2_GRAMMAR } from './n2-grammar';
import { N2_TOPICS } from './n2-vocab';
import { N2_KANJI } from './n2-kanji';

export const N2_CATALOG: TbLevelCatalog = {
  level: 'N2',
  categories: N2_CATEGORIES,
  grammar: N2_GRAMMAR,
  topics: N2_TOPICS,
  kanji: N2_KANJI,
};
