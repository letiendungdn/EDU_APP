/**
 * Lộ trình học "theo giáo trình".
 *
 * - Sou Matome / Shinkanzen / TRY!: bài SOẠN RIÊNG cho từng sách (Lesson.textbook, seed từ
 *   packages/prisma-nihongo/textbooks). Số bài = base + mã cấp×1000 + phần×100 + bài
 *   (Sou Matome 2xxxx, Shinkanzen 3xxxx, TRY! 4xxxx) — không lấy bài Minna / bài chung.
 *   Nội dung do app soạn theo khung sách, không chép sách (bản quyền NXB).
 *   · Sou Matome: 6 tuần × 6 ngày học + ngày 7 ôn tập.
 *   · Shinkanzen Master: 文法 (theo nhóm chức năng) → 語彙 (theo chủ đề) → 漢字 → 読解 → 聴解 → 模試. Không có N5.
 *   · TRY!: các chương ngữ pháp kèm từ vựng, bài đọc và file nghe.
 * - Kanji Look and Learn: 32 課 × 16 chữ; KanjiLesson 1–32 trong app chính là 32 bài của sách.
 *   N2/N1: bản cộng đồng (Duy Triều) — app không có thứ tự bài của bản này, dùng bài kanji N2/N1 của app.
 * - Minna no Nihongo: sơ cấp I = bài 1–25 (N5), sơ cấp II = bài 26–50 (N4) — chính là Lesson 1–50 trong app.
 */

import type { JlptMindLevel } from './jlpt-mind-map-shared';
import type { JlptTextbookSeries } from './jlpt-textbooks';

export type PlanLesson = {
  lessonNumber: number;
  title: string | null;
  jlptLevel?: string | null;
  /** Giáo trình (Lesson.textbook) */
  textbook?: string | null;
  /** Tên tuần / phần của bài giáo trình (Lesson.description) */
  description?: string | null;
  grammarCount?: number;
  vocabCount?: number;
};

export type PlanKanjiLesson = {
  lessonNumber: number;
  title: string | null;
  jlptLevel: string | null;
  textbook?: string | null;
};

export type PlanReading = { id: number; title: string; jlptLevel: string | null };

/** Mục trong "File nghe sách" đã lọc đúng bộ sách + cấp */
export type PlanAudio = { id: string; title: string; href: string };

export type PlanSource = {
  lessons: PlanLesson[];
  kanjiLessons: PlanKanjiLesson[];
  readings: PlanReading[];
  audio?: PlanAudio[];
};

export type PlanTaskKind = 'GRAMMAR' | 'VOCAB' | 'KANJI' | 'READING' | 'LISTENING' | 'REVIEW' | 'EXAM';

export type PlanTask = { kind: PlanTaskKind; label: string; href: string };

export type PlanUnit = {
  /** Khóa ổn định để lưu tiến độ */
  id: string;
  title: string;
  subtitle?: string;
  tasks: PlanTask[];
};

export type PlanSection = { id: string; title: string; titleJa?: string; units: PlanUnit[] };

export type StudyPlan = {
  series: JlptTextbookSeries;
  level: JlptMindLevel;
  sections: PlanSection[];
  unitCount: number;
};

export const MINNA_BOOKS: Record<'N5' | 'N4', { name: string; from: number; to: number }> = {
  N5: { name: '初級I', from: 1, to: 25 },
  N4: { name: '初級II', from: 26, to: 50 },
};

/** Kanji Look and Learn: cấp → Part và dải bài (課) */
export const KLL_PARTS: Record<'N5' | 'N4' | 'N3', { part: number; from: number; to: number }> = {
  N5: { part: 1, from: 1, to: 10 },
  N4: { part: 2, from: 11, to: 20 },
  N3: { part: 3, from: 21, to: 32 },
};

/** Sách có bài soạn riêng trong DB */
export const TEXTBOOK_COPY_SERIES = ['SOUMATOME', 'SHINKANZEN', 'TRY'] as const;
type CopySeries = (typeof TEXTBOOK_COPY_SERIES)[number];

/** 23204 → { section: 2, unit: 4 } */
export function parseTextbookNumber(n: number): { section: number; unit: number } {
  return { section: Math.floor((n % 1000) / 100), unit: n % 100 };
}

const byNumber = <T extends { lessonNumber: number }>(a: T, b: T) => a.lessonNumber - b.lessonNumber;

function lessonName(l: { lessonNumber: number; title: string | null }): string {
  return l.title?.trim() || `Bài ${l.lessonNumber}`;
}

const grammarTask = (l: PlanLesson): PlanTask => ({
  kind: 'GRAMMAR',
  label: `Ngữ pháp · ${lessonName(l)}`,
  href: `/grammar?lesson=${l.lessonNumber}`,
});
const vocabTask = (l: PlanLesson): PlanTask => ({
  kind: 'VOCAB',
  label: `Từ vựng · ${lessonName(l)}`,
  href: `/vocab?lesson=${l.lessonNumber}`,
});
const kanjiTask = (l: PlanKanjiLesson): PlanTask => ({
  kind: 'KANJI',
  label: `Kanji · ${lessonName(l)}`,
  href: `/kanji?lesson=${l.lessonNumber}`,
});
const readingTask = (r: PlanReading): PlanTask => ({
  kind: 'READING',
  label: `Đọc hiểu · ${r.title}`,
  href: `/reading/${r.id}`,
});
const audioTask = (a: PlanAudio): PlanTask => ({ kind: 'LISTENING', label: `File nghe · ${a.title}`, href: a.href });
const listeningTask: PlanTask = { kind: 'LISTENING', label: 'Nghe · các dạng bài nghe JLPT', href: '/listening-types' };
const mockExamTask: PlanTask = { kind: 'EXAM', label: 'Thi thử JLPT', href: '/mock-exam' };

function reviewTasks(): PlanTask[] {
  return [
    { kind: 'REVIEW', label: 'Ôn thẻ SRS từ vựng', href: '/srs' },
    { kind: 'REVIEW', label: 'Ôn SRS ngữ pháp', href: '/grammar-srs' },
    { kind: 'REVIEW', label: 'Làm lại từ sai', href: '/vocab-review' },
  ];
}

/** Chia `items` thành `n` phần gần đều nhau, giữ thứ tự. */
export function splitEvenly<T>(items: T[], n: number): T[][] {
  const out: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => out[Math.floor((i * n) / items.length)].push(item));
  return out;
}

type TextbookUnitSource = {
  lessonNumber: number;
  section: number;
  unit: number;
  sectionTitle: string | null;
  /** Phần sau "—" trong tiêu đề bài */
  topic: string | null;
  lesson?: PlanLesson;
  kanji?: PlanKanjiLesson;
};

/** Tên phần cố định khi phần chỉ có bài kanji (KanjiLesson không có description). */
const FIXED_SECTION_TITLES: Partial<Record<CopySeries, Record<number, string>>> = {
  SHINKANZEN: { 1: '文法 · Ngữ pháp', 2: '語彙 · Từ vựng', 3: '漢字 · Kanji' },
};

/** Bài soạn riêng của (sách, cấp): ghép Lesson và KanjiLesson cùng số, nhóm theo phần. */
function textbookSections(src: PlanSource, series: CopySeries, level: JlptMindLevel) {
  const byNumber = new Map<number, TextbookUnitSource>();
  const get = (n: number) => {
    let u = byNumber.get(n);
    if (!u) {
      u = { lessonNumber: n, ...parseTextbookNumber(n), sectionTitle: null, topic: null };
      byNumber.set(n, u);
    }
    return u;
  };
  const topicOf = (title: string | null) => title?.split(' — ').slice(1).join(' — ').trim() || null;
  for (const l of src.lessons) {
    if (l.textbook !== series || l.jlptLevel !== level) continue;
    const u = get(l.lessonNumber);
    u.lesson = l;
    u.sectionTitle = l.description ?? u.sectionTitle;
    u.topic = topicOf(l.title) ?? u.topic;
  }
  for (const k of src.kanjiLessons) {
    if (k.textbook !== series || k.jlptLevel !== level) continue;
    const u = get(k.lessonNumber);
    u.kanji = k;
    u.topic = u.topic ?? topicOf(k.title);
  }
  const sections = new Map<number, TextbookUnitSource[]>();
  for (const u of [...byNumber.values()].sort((a, b) => a.lessonNumber - b.lessonNumber)) {
    const list = sections.get(u.section) ?? [];
    list.push(u);
    sections.set(u.section, list);
  }
  return [...sections.entries()].map(([section, units]) => ({
    section,
    title:
      units.find((u) => u.sectionTitle)?.sectionTitle ?? FIXED_SECTION_TITLES[series]?.[section] ?? `Phần ${section}`,
    units,
  }));
}

function unitTasks(u: TextbookUnitSource): PlanTask[] {
  const tasks: PlanTask[] = [];
  const l = u.lesson;
  if (l && (l.grammarCount ?? 1) > 0) tasks.push({ kind: 'GRAMMAR', label: `Ngữ pháp · ${u.topic ?? `Bài ${l.lessonNumber}`}`, href: `/grammar?lesson=${l.lessonNumber}` });
  if (l && (l.vocabCount ?? 1) > 0) tasks.push({ kind: 'VOCAB', label: 'Từ vựng', href: `/vocab?lesson=${l.lessonNumber}` });
  if (u.kanji) tasks.push({ kind: 'KANJI', label: 'Kanji', href: `/kanji?lesson=${u.kanji.lessonNumber}` });
  if (l) tasks.push({ kind: 'REVIEW', label: 'Bài tập trắc nghiệm', href: `/quiz?lesson=${l.lessonNumber}` });
  return tasks;
}

function levelReadings(src: PlanSource, level: JlptMindLevel) {
  return src.readings.filter((r) => r.jlptLevel === level);
}

function buildSoumatome(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const weeks = textbookSections(src, 'SOUMATOME', level);
  const readings = splitEvenly(levelReadings(src, level), Math.max(weeks.length, 1));
  return weeks.map((week, w) => ({
    id: `week-${week.section}`,
    title: week.title,
    titleJa: `第${week.section}週`,
    units: [
      ...week.units.map((u) => ({
        id: `sm${u.lessonNumber}`,
        title: `Ngày ${u.unit}`,
        subtitle: u.topic ?? `${u.unit}日目`,
        tasks: unitTasks(u),
      })),
      {
        id: `week-${week.section}-review`,
        title: 'Ngày 7 · Ôn tập tuần',
        subtitle: 'まとめ問題',
        tasks: [
          ...(readings[w] ?? []).map(readingTask),
          ...(src.audio ?? []).map(audioTask),
          ...reviewTasks(),
          ...(w === weeks.length - 1 ? [mockExamTask] : []),
        ],
      },
    ],
  }));
}

function buildShinkanzen(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const parts = textbookSections(src, 'SHINKANZEN', level);
  if (!parts.length) return [];
  const skillSections: PlanSection[] = parts.map((part) => {
    const [titleJa, title] = part.title.split(' · ');
    return {
      id: `skill-${part.section}`,
      title: title ?? part.title,
      titleJa: title ? titleJa : undefined,
      units: part.units.map((u) => ({
        id: `sk${u.lessonNumber}`,
        title: part.section === 3 ? `Buổi ${u.unit}` : `Phần ${u.unit}`,
        subtitle: u.topic ?? undefined,
        tasks: unitTasks(u),
      })),
    };
  });
  const readings = levelReadings(src, level);
  return [
    ...skillSections,
    ...(readings.length
      ? [
          {
            id: 'dokkai',
            title: 'Đọc hiểu',
            titleJa: '読解',
            units: readings.map((r, i) => ({ id: `r${r.id}`, title: `Bài đọc ${i + 1}`, subtitle: r.title, tasks: [readingTask(r)] })),
          },
        ]
      : []),
    {
      id: 'choukai',
      title: 'Nghe hiểu',
      titleJa: '聴解',
      units: [
        {
          id: 'listening',
          title: 'Các dạng bài nghe',
          tasks: [
            ...(src.audio ?? []).map(audioTask),
            listeningTask,
            { kind: 'LISTENING', label: 'Nghe mỗi ngày', href: '/daily-listening' },
          ],
        },
      ],
    },
    {
      id: 'moshi',
      title: 'Thi thử',
      titleJa: '模擬試験',
      units: [{ id: 'mock', title: 'Đề thi thử', tasks: [mockExamTask] }],
    },
  ];
}

function buildTry(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const chapters = textbookSections(src, 'TRY', level).flatMap((s) => s.units);
  if (!chapters.length) return [];
  const readings = levelReadings(src, level);
  return [
    {
      id: 'chapters',
      title: 'Các chương',
      titleJa: '文法から伸ばす',
      units: chapters.map((u, i) => ({
        id: `try${u.lessonNumber}`,
        title: `Chương ${u.unit}`,
        subtitle: u.topic ?? undefined,
        tasks: [
          ...unitTasks(u),
          ...(readings.length ? [readingTask(readings[i % readings.length])] : []),
          ...(src.audio ?? []).map(audioTask),
        ],
      })),
    },
    {
      id: 'practice',
      title: 'Luyện đề',
      titleJa: '練習問題',
      units: [{ id: 'practice', title: 'Ôn & thi thử', tasks: [...reviewTasks(), mockExamTask] }],
    },
  ];
}

function buildKllCommunity(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const lessons = src.kanjiLessons
    .filter((l) => l.jlptLevel === level && !(TEXTBOOK_COPY_SERIES as readonly string[]).includes(l.textbook ?? ''))
    .sort(byNumber);
  return [
    {
      id: `community-${level}`,
      title: `Kanji ${level} (bản Duy Triều)`,
      titleJa: `${level}漢字`,
      units: lessons.map((l, i) => ({
        id: `kllc${l.lessonNumber}`,
        title: `Buổi ${i + 1}`,
        subtitle: lessonName(l),
        tasks: [kanjiTask(l), { kind: 'KANJI', label: 'Luyện viết nét', href: '/kanji-practice' }],
      })),
    },
    {
      id: 'review',
      title: 'Ôn tập',
      titleJa: 'まとめ',
      units: [
        {
          id: 'review',
          title: `Ôn kanji ${level}`,
          tasks: [
            { kind: 'REVIEW', label: 'Trắc nghiệm kanji', href: '/kanji/quiz' },
            { kind: 'REVIEW', label: `Bảng Kanji JLPT ${level}`, href: '/kanji/list' },
          ],
        },
      ],
    },
  ];
}

function buildKll(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  if (level === 'N2' || level === 'N1') return buildKllCommunity(src, level);
  const range = KLL_PARTS[level as keyof typeof KLL_PARTS];
  const lessons = src.kanjiLessons
    .filter((l) => l.lessonNumber >= range.from && l.lessonNumber <= range.to)
    .sort(byNumber);
  const quiz: PlanTask = { kind: 'REVIEW', label: 'Trắc nghiệm kanji', href: '/kanji/quiz' };
  return [
    {
      id: `part-${range.part}`,
      title: `Part ${range.part} · Bài ${range.from}–${range.to}`,
      titleJa: `第${range.from}〜${range.to}課`,
      units: lessons.map((l) => ({
        id: `kll${l.lessonNumber}`,
        title: `Bài ${l.lessonNumber}`,
        subtitle: `第${l.lessonNumber}課`,
        tasks: [
          kanjiTask(l),
          { kind: 'KANJI', label: 'Luyện viết nét', href: '/kanji-practice' },
          ...(l.lessonNumber % 2 === 0 ? [quiz] : []),
        ],
      })),
    },
    {
      id: 'review',
      title: 'Ôn tập Part',
      titleJa: 'まとめ',
      units: [
        {
          id: 'review',
          title: `Ôn Part ${range.part}`,
          tasks: [
            quiz,
            { kind: 'REVIEW', label: 'Kanji trong từ', href: '/kanji-readings' },
            { kind: 'REVIEW', label: `Bảng Kanji JLPT ${level}`, href: '/kanji/list' },
          ],
        },
      ],
    },
  ];
}

function buildMinna(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const book = MINNA_BOOKS[level as keyof typeof MINNA_BOOKS];
  const lessons = src.lessons
    .filter((l) => l.lessonNumber >= book.from && l.lessonNumber <= book.to)
    .sort(byNumber);
  const hasCounts = lessons.some((l) => l.grammarCount != null || l.vocabCount != null);
  return [
    {
      id: 'lessons',
      title: `${book.name} · Bài ${book.from}–${book.to}`,
      titleJa: `みんなの日本語 ${book.name}`,
      units: lessons.map((l) => ({
        id: `m${l.lessonNumber}`,
        title: `Bài ${l.lessonNumber}`,
        subtitle: `第${l.lessonNumber}課`,
        tasks: [
          ...(!hasCounts || (l.vocabCount ?? 0) > 0 ? [vocabTask(l)] : []),
          ...(!hasCounts || (l.grammarCount ?? 0) > 0 ? [grammarTask(l)] : []),
        ],
      })),
    },
    {
      id: 'listening',
      title: 'File nghe',
      titleJa: '聴解',
      units: [
        {
          id: 'listening',
          title: 'Sách giáo khoa & 25 bài nghe',
          tasks: [...(src.audio ?? []).map(audioTask), listeningTask],
        },
      ],
    },
    {
      id: 'review',
      title: 'Ôn tập',
      titleJa: '復習',
      units: [{ id: 'review', title: 'Ôn & thi thử', tasks: [...reviewTasks(), mockExamTask] }],
    },
  ];
}

/**
 * @param planLevels các cấp bộ sách có lộ trình (TextbookSeries.planLevels trong DB)
 * @returns null nếu bộ sách không có lộ trình ở cấp này
 */
export function buildStudyPlan(
  series: JlptTextbookSeries,
  level: JlptMindLevel,
  src: PlanSource,
  planLevels: JlptMindLevel[],
): StudyPlan | null {
  if (!planLevels.includes(level)) return null;
  const sections =
    series === 'SOUMATOME'
      ? buildSoumatome(src, level)
      : series === 'SHINKANZEN'
        ? buildShinkanzen(src, level)
        : series === 'KLL'
          ? buildKll(src, level)
          : series === 'MINNA'
            ? buildMinna(src, level)
            : buildTry(src, level);
  return { series, level, sections, unitCount: sections.reduce((n, sec) => n + sec.units.length, 0) };
}
