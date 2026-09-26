/** Dữ liệu mặc định của sơ đồ chủ đề (bảng MindMapLevel) — chỉ dùng để seed. */
export type MindLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type MindItem = {
  pattern: string;
  meaning: string;
  href?: string;
  lessonNumber?: number;
  linkLabel?: string;
};

export type MindBranch = {
  id: string;
  label: string;
  labelJa?: string;
  hint?: string;
  posX?: number;
  posY?: number;
  patterns: MindItem[];
};

export type MindMapLevelData = {
  level: MindLevel;
  title: string;
  summary: string;
  accent: string;
  branches: MindBranch[];
};
