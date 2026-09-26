/**
 * Lộ trình học "theo giáo trình" — xếp nội dung CỦA APP (bài ngữ pháp / từ vựng / kanji / đọc hiểu)
 * theo khung của từng bộ sách luyện thi. Không chép nội dung sách (bản quyền NXB);
 * người học dùng sách song song và ghi số trang vào từng buổi.
 *
 * - Sou Matome: 6 tuần × 7 ngày, ngày 7 mỗi tuần là ôn tập.
 * - Shinkanzen Master: học sâu theo từng kỹ năng (文法 → 語彙 → 漢字 → 読解 → 聴解 → 模試). Không có N5.
 * - TRY!: ngữ pháp là trục chính, mỗi chương = 1 bài ngữ pháp + từ vựng cùng bài + 1 bài đọc.
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
  grammarCount?: number;
  vocabCount?: number;
};

export type PlanKanjiLesson = { lessonNumber: number; title: string | null; jlptLevel: string | null };

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

export const PLAN_LEVELS: Record<JlptTextbookSeries, JlptMindLevel[]> = {
  SOUMATOME: ['N5', 'N4', 'N3', 'N2', 'N1'],
  SHINKANZEN: ['N4', 'N3', 'N2', 'N1'],
  TRY: ['N5', 'N4', 'N3', 'N2', 'N1'],
  KLL: ['N5', 'N4', 'N3', 'N2', 'N1'],
  // Trung cấp (N3/N2) chưa có bài trong app → chưa có lộ trình.
  MINNA: ['N5', 'N4'],
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

const SOUMATOME_WEEKS = 6;
const SOUMATOME_STUDY_DAYS_PER_WEEK = 6;

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

function levelSlice(src: PlanSource, level: JlptMindLevel) {
  const lessons = src.lessons.filter((l) => l.jlptLevel === level).sort(byNumber);
  return {
    grammarLessons: lessons.filter((l) => (l.grammarCount ?? 0) > 0),
    vocabLessons: lessons.filter((l) => (l.vocabCount ?? 0) > 0),
    kanjiLessons: src.kanjiLessons.filter((l) => l.jlptLevel === level).sort(byNumber),
    readings: src.readings.filter((r) => r.jlptLevel === level),
  };
}

function buildSoumatome(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const s = levelSlice(src, level);
  const totalDays = SOUMATOME_WEEKS * SOUMATOME_STUDY_DAYS_PER_WEEK;
  const g = splitEvenly(s.grammarLessons, totalDays);
  const v = splitEvenly(s.vocabLessons, totalDays);
  const k = splitEvenly(s.kanjiLessons, totalDays);
  const r = splitEvenly(s.readings, SOUMATOME_WEEKS);

  return Array.from({ length: SOUMATOME_WEEKS }, (_, w) => {
    const units: PlanUnit[] = [];
    for (let d = 0; d < SOUMATOME_STUDY_DAYS_PER_WEEK; d++) {
      const i = w * SOUMATOME_STUDY_DAYS_PER_WEEK + d;
      const tasks = [...g[i].map(grammarTask), ...v[i].map(vocabTask), ...k[i].map(kanjiTask)];
      units.push({
        id: `w${w + 1}d${d + 1}`,
        title: `Ngày ${d + 1}`,
        subtitle: `${d + 1}日目`,
        tasks: tasks.length ? tasks : reviewTasks().slice(0, 1),
      });
    }
    units.push({
      id: `w${w + 1}d7`,
      title: 'Ngày 7 · Ôn tập tuần',
      subtitle: 'まとめ問題',
      tasks: [
        ...r[w].map(readingTask),
        ...(src.audio ?? []).map(audioTask),
        ...reviewTasks(),
        ...(w === SOUMATOME_WEEKS - 1 ? [mockExamTask] : []),
      ],
    });
    return { id: `week-${w + 1}`, title: `Tuần ${w + 1}`, titleJa: `第${w + 1}週`, units };
  });
}

function buildShinkanzen(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const s = levelSlice(src, level);
  const sections: PlanSection[] = [
    {
      id: 'bunpou',
      title: 'Ngữ pháp',
      titleJa: '文法',
      units: s.grammarLessons.map((l, i) => ({
        id: `g${l.lessonNumber}`,
        title: `Phần ${i + 1}`,
        subtitle: lessonName(l),
        tasks: [grammarTask(l)],
      })),
    },
    {
      id: 'goi',
      title: 'Từ vựng',
      titleJa: '語彙',
      units: s.vocabLessons.map((l, i) => ({
        id: `v${l.lessonNumber}`,
        title: `Phần ${i + 1}`,
        subtitle: lessonName(l),
        tasks: [vocabTask(l)],
      })),
    },
    {
      id: 'kanji',
      title: 'Kanji',
      titleJa: '漢字',
      units: s.kanjiLessons.map((l, i) => ({
        id: `k${l.lessonNumber}`,
        title: `Buổi ${i + 1}`,
        subtitle: lessonName(l),
        tasks: [kanjiTask(l)],
      })),
    },
    {
      id: 'dokkai',
      title: 'Đọc hiểu',
      titleJa: '読解',
      units: s.readings.map((r, i) => ({
        id: `r${r.id}`,
        title: `Bài đọc ${i + 1}`,
        subtitle: r.title,
        tasks: [readingTask(r)],
      })),
    },
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
  return sections.filter((sec) => sec.units.length > 0);
}

function buildTry(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const s = levelSlice(src, level);
  const vocabByLesson = new Map(s.vocabLessons.map((l) => [l.lessonNumber, l]));
  const units: PlanUnit[] = s.grammarLessons.map((l, i) => {
    const vocab = vocabByLesson.get(l.lessonNumber);
    const reading = s.readings.length ? s.readings[i % s.readings.length] : undefined;
    return {
      id: `c${l.lessonNumber}`,
      title: `Chương ${i + 1}`,
      subtitle: lessonName(l),
      tasks: [
        grammarTask(l),
        ...(vocab ? [vocabTask(vocab)] : []),
        ...(reading ? [readingTask(reading)] : []),
        ...(src.audio ?? []).map(audioTask),
      ],
    };
  });
  return [
    { id: 'chapters', title: 'Các chương', titleJa: '文法から伸ばす', units },
    {
      id: 'practice',
      title: 'Luyện đề',
      titleJa: '練習問題',
      units: [{ id: 'practice', title: 'Ôn & thi thử', tasks: [...reviewTasks(), mockExamTask] }],
    },
  ];
}

function buildKllCommunity(src: PlanSource, level: JlptMindLevel): PlanSection[] {
  const lessons = src.kanjiLessons.filter((l) => l.jlptLevel === level).sort(byNumber);
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

export function buildStudyPlan(series: JlptTextbookSeries, level: JlptMindLevel, src: PlanSource): StudyPlan | null {
  if (!PLAN_LEVELS[series].includes(level)) return null;
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
