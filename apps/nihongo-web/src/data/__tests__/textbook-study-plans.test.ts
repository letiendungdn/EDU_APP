import { describe, expect, it } from 'vitest';
import { buildStudyPlan, splitEvenly, type PlanSource } from '../textbook-study-plans';

const src: PlanSource = {
  lessons: [
    ...Array.from({ length: 10 }, (_, i) => ({
      lessonNumber: 301 + i,
      title: `N3 · Bài ${i + 1}`,
      jlptLevel: 'N3',
      grammarCount: 5,
      vocabCount: i < 4 ? 20 : 0,
    })),
    { lessonNumber: 1, title: null, jlptLevel: 'N5', grammarCount: 3, vocabCount: 30 },
  ],
  kanjiLessons: [{ lessonNumber: 21, title: 'Kanji N3-1', jlptLevel: 'N3' }],
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

describe('buildStudyPlan', () => {
  it('Sou Matome = 6 weeks × 7 days, every N3 lesson used once, day 7 is review', () => {
    const plan = buildStudyPlan('SOUMATOME', 'N3', src)!;
    expect(plan.sections).toHaveLength(6);
    expect(plan.sections.every((s) => s.units.length === 7)).toBe(true);
    const grammar = allTasks(plan).filter((t) => t.kind === 'GRAMMAR').map((t) => t.href);
    expect(grammar).toHaveLength(10);
    expect(new Set(grammar).size).toBe(10);
    expect(grammar).not.toContain('/grammar?lesson=1');
    expect(plan.sections[0].units[6].tasks.some((t) => t.kind === 'REVIEW')).toBe(true);
  });

  it('Shinkanzen has no N5 and groups by skill', () => {
    expect(buildStudyPlan('SHINKANZEN', 'N5', src)).toBeNull();
    const plan = buildStudyPlan('SHINKANZEN', 'N3', src)!;
    expect(plan.sections.map((s) => s.id)).toEqual(['bunpou', 'goi', 'kanji', 'dokkai', 'choukai', 'moshi']);
    expect(plan.sections[1].units).toHaveLength(4);
    expect(plan.sections[2].units[0].tasks[0].href).toBe('/kanji?lesson=21');
  });

  it('TRY! chapters pair grammar with same-lesson vocab and a reading', () => {
    const plan = buildStudyPlan('TRY', 'N3', src)!;
    const first = plan.sections[0].units[0];
    expect(first.tasks.map((t) => t.href)).toEqual(['/grammar?lesson=301', '/vocab?lesson=301', '/reading/7']);
    expect(plan.sections[0].units[9].tasks.map((t) => t.kind)).toEqual(['GRAMMAR', 'READING']);
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
  const hrefs = (plan: ReturnType<typeof buildStudyPlan>) => allTasks(plan).map((t) => t.href);

  it('adds the audio to TRY! chapters, Shinkanzen 聴解 and Sou Matome review days', () => {
    expect(buildStudyPlan('TRY', 'N3', withAudio)!.sections[0].units[0].tasks.at(-1)!.href).toBe(audio[0].href);
    const sk = buildStudyPlan('SHINKANZEN', 'N3', withAudio)!;
    expect(sk.sections.find((s) => s.id === 'choukai')!.units[0].tasks[0].href).toBe(audio[0].href);
    const sm = buildStudyPlan('SOUMATOME', 'N3', withAudio)!;
    expect(sm.sections.every((w) => w.units[6].tasks.some((t) => t.href === audio[0].href))).toBe(true);
    expect(hrefs(buildStudyPlan('TRY', 'N3', src))).not.toContain(audio[0].href);
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
