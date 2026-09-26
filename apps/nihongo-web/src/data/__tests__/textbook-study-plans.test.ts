import { describe, expect, it } from 'vitest';
import { buildStudyPlan as build, parseTextbookNumber, splitEvenly, type PlanSource } from '../textbook-study-plans';
import type { JlptMindLevel } from '../jlpt-mind-map-shared';
import type { JlptTextbookSeries } from '../jlpt-textbooks';

/** Cấp có lộ trình — trước nằm cứng trong code, nay lấy từ TextbookSeries.planLevels (DB). */
const LEVELS: Record<JlptTextbookSeries, JlptMindLevel[]> = {
  SOUMATOME: ['N5', 'N4', 'N3', 'N2', 'N1'],
  SHINKANZEN: ['N4', 'N3', 'N2', 'N1'],
  TRY: ['N5', 'N4', 'N3', 'N2', 'N1'],
  KLL: ['N5', 'N4', 'N3', 'N2', 'N1'],
  MINNA: ['N5', 'N4'],
};
const buildStudyPlan = (series: JlptTextbookSeries, level: JlptMindLevel, src: PlanSource) =>
  build(series, level, src, LEVELS[series]);

/** Bài soạn riêng theo số của seed: base + cấp×1000 + phần×100 + bài */
const tb = (textbook: string, n: number, description: string, topic: string, level = 'N3') => ({
  lessonNumber: n,
  title: `${textbook} ${level} · … — ${topic}`,
  jlptLevel: level,
  textbook,
  description,
  grammarCount: 2,
  vocabCount: 10,
});

const src: PlanSource = {
  lessons: [
    // Sou Matome N3: 2 tuần × 2 ngày
    tb('SOUMATOME', 23101, 'Tuần 1 · Gia đình（家族）', '〜ように'),
    tb('SOUMATOME', 23102, 'Tuần 1 · Gia đình（家族）', '〜ために'),
    tb('SOUMATOME', 23201, 'Tuần 2 · Công việc（仕事）', '〜ばかり'),
    tb('SOUMATOME', 23202, 'Tuần 2 · Công việc（仕事）', '〜ところ'),
    // Shinkanzen N3: 文法 + 語彙
    tb('SHINKANZEN', 33101, '文法 · Ngữ pháp', 'Thời điểm'),
    { ...tb('SHINKANZEN', 33201, '語彙 · Từ vựng', 'Gia đình'), grammarCount: 0 },
    // TRY! N3: 2 chương
    tb('TRY', 43101, 'Các chương · 文法から伸ばす', 'Chương 1: Thời điểm'),
    tb('TRY', 43102, 'Các chương · 文法から伸ばす', 'Chương 2: Lý do'),
    // Nội dung KHÔNG được lẫn vào lộ trình sách
    { lessonNumber: 30, title: 'Minna 30', jlptLevel: 'N4', textbook: 'MINNA', grammarCount: 3, vocabCount: 30 },
    { lessonNumber: 301, title: 'N3 · Bài 1', jlptLevel: 'N3', textbook: null, grammarCount: 12, vocabCount: 20 },
  ],
  kanjiLessons: [
    { lessonNumber: 23101, title: 'SM kanji', jlptLevel: 'N3', textbook: 'SOUMATOME' },
    { lessonNumber: 33301, title: 'SK kanji — 家族', jlptLevel: 'N3', textbook: 'SHINKANZEN' },
    { lessonNumber: 21, title: 'KLL 21', jlptLevel: 'N3', textbook: 'KLL' },
  ],
  readings: [{ id: 7, title: 'Đọc N3', jlptLevel: 'N3' }],
};

const allTasks = (plan: ReturnType<typeof buildStudyPlan>) =>
  plan!.sections.flatMap((s) => s.units.flatMap((u) => u.tasks));

describe('splitEvenly', () => {
  it('keeps order and spreads items over n buckets', () => {
    expect(splitEvenly([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(splitEvenly([1, 2], 4)).toEqual([[1], [], [2], []]);
  });
});

describe('buildStudyPlan (bài soạn riêng theo sách)', () => {
  it('parses textbook lesson numbers', () => {
    expect(parseTextbookNumber(23204)).toEqual({ section: 2, unit: 4 });
    expect(parseTextbookNumber(43112)).toEqual({ section: 1, unit: 12 });
  });

  it('Sou Matome: weeks from the book lessons, day 7 review, kanji of the same day', () => {
    const plan = buildStudyPlan('SOUMATOME', 'N3', src)!;
    expect(plan.sections.map((s) => s.title)).toEqual(['Tuần 1 · Gia đình（家族）', 'Tuần 2 · Công việc（仕事）']);
    expect(plan.sections[0].units.map((u) => u.title)).toEqual(['Ngày 1', 'Ngày 2', 'Ngày 7 · Ôn tập tuần']);
    expect(plan.sections[0].units[0].subtitle).toBe('〜ように');
    expect(plan.sections[0].units[0].tasks.map((t) => t.href)).toEqual([
      '/grammar?lesson=23101',
      '/vocab?lesson=23101',
      '/kanji?lesson=23101',
      '/quiz?lesson=23101',
    ]);
  });

  it('never mixes in Minna or the general JLPT lessons', () => {
    for (const series of ['SOUMATOME', 'SHINKANZEN', 'TRY'] as const) {
      const hrefs = allTasks(buildStudyPlan(series, 'N3', src)).map((t) => t.href);
      expect(hrefs.some((h) => /lesson=(30|301|21)$/.test(h))).toBe(false);
    }
  });

  it('Shinkanzen groups by skill and has no N5', () => {
    expect(buildStudyPlan('SHINKANZEN', 'N5', src)).toBeNull();
    const plan = buildStudyPlan('SHINKANZEN', 'N3', src)!;
    expect(plan.sections.map((s) => s.titleJa ?? s.title)).toEqual(['文法', '語彙', '漢字', '読解', '聴解', '模擬試験']);
    expect(plan.sections[1].units[0].tasks.map((t) => t.kind)).toEqual(['VOCAB', 'REVIEW']);
    expect(plan.sections[2].units[0].tasks.map((t) => t.href)).toEqual(['/kanji?lesson=33301']);
  });

  it('TRY! chapters come from TRY lessons', () => {
    const plan = buildStudyPlan('TRY', 'N3', src)!;
    expect(plan.sections[0].units.map((u) => u.subtitle)).toEqual(['Chương 1: Thời điểm', 'Chương 2: Lý do']);
    expect(plan.sections[0].units[0].tasks[0].href).toBe('/grammar?lesson=43101');
  });

  it('empty when the book has no lessons for that level yet', () => {
    expect(buildStudyPlan('SOUMATOME', 'N1', src)!.sections).toEqual([]);
    expect(buildStudyPlan('TRY', 'N1', src)!.sections).toEqual([]);
  });
});

describe('Kanji Look and Learn plan', () => {
  const kll: PlanSource = {
    lessons: [],
    kanjiLessons: Array.from({ length: 32 }, (_, i) => ({
      lessonNumber: i + 1,
      title: `Bài ${i + 1}`,
      jlptLevel: i < 10 ? 'N5' : i < 20 ? 'N4' : 'N3',
    })),
    readings: [],
  };

  it('maps N5/N4/N3 to book parts 1–10 / 11–20 / 21–32 and has no N2', () => {
    const lessonsOf = (lv: 'N5' | 'N4' | 'N3') =>
      buildStudyPlan('KLL', lv, kll)!.sections[0].units.map((u) => u.tasks[0].href);
    expect(lessonsOf('N5')).toHaveLength(10);
    expect(lessonsOf('N4')[0]).toBe('/kanji?lesson=11');
    expect(lessonsOf('N3')).toHaveLength(12);
    expect(lessonsOf('N3').at(-1)).toBe('/kanji?lesson=32');
  });

  it('N2/N1 use the app\'s N2/N1 kanji lessons (community edition)', () => {
    const withN2: PlanSource = {
      ...kll,
      kanjiLessons: [...kll.kanjiLessons, { lessonNumber: 401, title: 'N2-1', jlptLevel: 'N2' }],
    };
    const plan = buildStudyPlan('KLL', 'N2', withN2)!;
    expect(plan.sections[0].units.map((u) => u.tasks[0].href)).toEqual(['/kanji?lesson=401']);
  });
});

describe('book audio in plans', () => {
  const audio = [{ id: 'n3-try-n3-41', title: 'Try N3', href: '/book-audio?level=N3&item=n3-try-n3-41' }];
  const withAudio: PlanSource = { ...src, audio };

  it('adds the audio to TRY! chapters, Shinkanzen 聴解 and Sou Matome review days', () => {
    expect(buildStudyPlan('TRY', 'N3', withAudio)!.sections[0].units[0].tasks.at(-1)!.href).toBe(audio[0].href);
    const sk = buildStudyPlan('SHINKANZEN', 'N3', withAudio)!;
    expect(sk.sections.find((s) => s.id === 'choukai')!.units[0].tasks[0].href).toBe(audio[0].href);
    const sm = buildStudyPlan('SOUMATOME', 'N3', withAudio)!;
    expect(sm.sections.every((w) => w.units.at(-1)!.tasks.some((t) => t.href === audio[0].href))).toBe(true);
    expect(allTasks(buildStudyPlan('TRY', 'N3', src)).map((t) => t.href)).not.toContain(audio[0].href);
  });
});

describe('Minna no Nihongo plan', () => {
  const minna: PlanSource = {
    lessons: Array.from({ length: 50 }, (_, i) => ({
      lessonNumber: i + 1,
      title: null,
      jlptLevel: i < 25 ? 'N5' : 'N4',
      grammarCount: 4,
      vocabCount: 30,
    })),
    kanjiLessons: [],
    readings: [],
    audio: [{ id: 'n5-minna', title: 'Minnano 25 bài nghe hiểu N5', href: '/book-audio?level=N5&item=n5-minna' }],
  };

  it('初級I = bài 1–25 (N5), 初級II = bài 26–50 (N4); no plan for 中級 yet', () => {
    const n5 = buildStudyPlan('MINNA', 'N5', minna)!;
    expect(n5.sections[0].units).toHaveLength(25);
    expect(n5.sections[0].units[0].tasks.map((t) => t.href)).toEqual(['/vocab?lesson=1', '/grammar?lesson=1']);
    expect(n5.sections[1].units[0].tasks[0].href).toBe('/book-audio?level=N5&item=n5-minna');
    const n4 = buildStudyPlan('MINNA', 'N4', minna)!;
    expect(n4.sections[0].units[0].title).toBe('Bài 26');
    expect(n4.sections[0].units.at(-1)!.title).toBe('Bài 50');
    expect(buildStudyPlan('MINNA', 'N3', minna)).toBeNull();
  });
});
