import type { TbLevelCatalog } from '../types';
import { N5_CATALOG } from './n5';
import { N4_CATALOG } from './n4';
import { N3_CATALOG } from './n3';
import { N2_CATALOG } from './n2';
import { N1_CATALOG } from './n1';

/** Các cấp đã soạn — thêm cấp mới vào đây. */
export const TEXTBOOK_CATALOGS: TbLevelCatalog[] = [N5_CATALOG, N4_CATALOG, N3_CATALOG, N2_CATALOG, N1_CATALOG];
