import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { ExerciseType } from '@prisma/client';
import {
  sample,
  shuffle,
  speechTextFromJapanese,
  normalizeAnswer,
} from '@app/common';
import { PrismaService } from '@app/prisma';
import { randomUUID } from 'crypto';

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const sessionKey = (examId: string) => `mock-exam:${examId}`;

function exerciseOptions(exercise: {
  optionsList?: { text: string }[];
}): string[] {
  return exercise.optionsList?.map((o) => o.text) ?? [];
}

function toQuestionType(
  type: ExerciseType,
): 'multiple_choice' | 'fill_in_blank' {
  return type === 'MULTIPLE_CHOICE' ? 'multiple_choice' : 'fill_in_blank';
}

export type MockExamLevel = 'n5' | 'n4';

export interface MockExamQuestionPublic {
  id: string;
  sectionId: string;
  sectionName: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'listening';
  question: string;
  options?: string[];
  audioText?: string;
  lessonNumber?: number;
}

export interface MockExamReviewItem extends MockExamQuestionPublic {
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface MockExamSession {
  examId: string;
  level: MockExamLevel;
  title: string;
  durationMinutes: number;
  startedAt: string;
  questions: MockExamQuestionPublic[];
  answerKey: Record<string, string>;
}

interface LevelConfig {
  title: string;
  durationMinutes: number;
  lessonFrom: number;
  lessonTo: number;
  kanjiLessonFrom: number;
  kanjiLessonTo: number;
  vocabCount: number;
  grammarCount: number;
  kanjiCount: number;
  listeningWordCount: number;
  listeningSentenceCount: number;
}

const LEVEL_CONFIG: Record<MockExamLevel, LevelConfig> = {
  n5: {
    title: 'Đề thi thử JLPT N5',
    durationMinutes: 50,
    lessonFrom: 1,
    lessonTo: 25,
    kanjiLessonFrom: 1,
    kanjiLessonTo: 10,
    vocabCount: 12,
    grammarCount: 8,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
  },
  n4: {
    title: 'Đề thi thử JLPT N4',
    durationMinutes: 65,
    lessonFrom: 26,
    lessonTo: 50,
    kanjiLessonFrom: 11,
    kanjiLessonTo: 20,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
  },
};

@Injectable()
export class MockExamsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  listTemplates() {
    return (Object.keys(LEVEL_CONFIG) as MockExamLevel[]).map((level) => {
      const cfg = LEVEL_CONFIG[level];
      const totalQuestions =
        cfg.vocabCount +
        cfg.grammarCount +
        cfg.kanjiCount +
        cfg.listeningWordCount +
        cfg.listeningSentenceCount;
      return {
        level,
        title: cfg.title,
        durationMinutes: cfg.durationMinutes,
        totalQuestions,
        lessonRange: `${cfg.lessonFrom}–${cfg.lessonTo}`,
        description:
          level === 'n5'
            ? 'Từ vựng, ngữ pháp, kanji & nghe (Minna I + KLL N5)'
            : 'Từ vựng, ngữ pháp, kanji & nghe (Minna II + KLL N4)',
      };
    });
  }

  async start(level: MockExamLevel) {
    const cfg = LEVEL_CONFIG[level];
    if (!cfg) {
      throw new RpcException({
        statusCode: 404,
        message: `Cấp độ ${level} không hỗ trợ`,
      });
    }

    const lessons = await this.prisma.lesson.findMany({
      where: {
        lessonNumber: { gte: cfg.lessonFrom, lte: cfg.lessonTo },
      },
      select: { id: true, lessonNumber: true },
    });

    const lessonIds = lessons.map((l) => l.id);
    const lessonById = new Map(lessons.map((l) => [l.id, l.lessonNumber]));

    const exercises = lessonIds.length
      ? await this.prisma.exercise.findMany({
          where: { lessonId: { in: lessonIds } },
          include: { optionsList: { orderBy: { sortOrder: 'asc' } } },
        })
      : [];

    const vocabPool = exercises.filter((e) => e.type === 'MULTIPLE_CHOICE');
    const grammarPool = exercises.filter(
      (e) => e.type === 'MULTIPLE_CHOICE' || e.type === 'FILL_IN_BLANK',
    );

    const pickedVocab = sample(vocabPool, cfg.vocabCount);
    const vocabIds = new Set(pickedVocab.map((e) => e.id));
    const grammarCandidates = grammarPool.filter((e) => !vocabIds.has(e.id));
    const pickedGrammar = sample(grammarCandidates, cfg.grammarCount);

    const kanjiEntries = await this.prisma.kanjiEntry.findMany({
      where: {
        lesson: {
          lessonNumber: { gte: cfg.kanjiLessonFrom, lte: cfg.kanjiLessonTo },
        },
      },
      include: { lesson: { select: { lessonNumber: true } } },
    });

    const pickedKanji = sample(kanjiEntries, cfg.kanjiCount);
    const kanjiQuestions = this.buildKanjiQuestions(pickedKanji, kanjiEntries);

    const vocabularies = lessonIds.length
      ? await this.prisma.vocabulary.findMany({
          where: { lessonId: { in: lessonIds } },
          include: { lesson: { select: { lessonNumber: true } } },
        })
      : [];

    const grammars = lessonIds.length
      ? await this.prisma.grammar.findMany({
          where: { lessonId: { in: lessonIds } },
          include: {
            examples: true,
            lesson: { select: { lessonNumber: true } },
          },
        })
      : [];

    const listeningWordQuestions = this.buildVocabListeningQuestions(
      sample(
        vocabularies.filter((v) => v.kana && v.meaning?.trim()),
        cfg.listeningWordCount,
      ),
      vocabularies,
    );

    const examplePool = grammars.flatMap((g) =>
      g.examples
        .filter((e) => e.vi?.trim() && e.jp?.trim())
        .map((e) => ({
          jp: e.jp,
          vi: e.vi as string,
          lessonNumber: g.lesson.lessonNumber,
        })),
    );

    const listeningSentenceQuestions = this.buildSentenceListeningQuestions(
      sample(examplePool, cfg.listeningSentenceCount),
      examplePool,
    );

    let index = 0;
    const questions: MockExamQuestionPublic[] = [];
    const answerKey: Record<string, string> = {};

    const pushQuestion = (
      sectionId: string,
      sectionName: string,
      type: 'multiple_choice' | 'fill_in_blank' | 'listening',
      question: string,
      answer: string,
      options?: string[],
      lessonNumber?: number,
      audioText?: string,
    ) => {
      index += 1;
      const id = `q${index}`;
      questions.push({
        id,
        sectionId,
        sectionName,
        type,
        question,
        options,
        lessonNumber,
        audioText,
      });
      answerKey[id] = answer;
    };

    for (const ex of pickedVocab) {
      pushQuestion(
        'vocab',
        'Từ vựng',
        'multiple_choice',
        ex.question,
        ex.answer,
        shuffle(exerciseOptions(ex)),
        lessonById.get(ex.lessonId),
      );
    }

    for (const ex of pickedGrammar) {
      const type = toQuestionType(ex.type);
      pushQuestion(
        'grammar',
        'Ngữ pháp',
        type,
        ex.question,
        ex.answer,
        type === 'multiple_choice' ? shuffle(exerciseOptions(ex)) : undefined,
        lessonById.get(ex.lessonId),
      );
    }

    for (const kq of kanjiQuestions) {
      pushQuestion(
        'kanji',
        'Kanji',
        'multiple_choice',
        kq.question,
        kq.answer,
        shuffle(kq.options),
        kq.lessonNumber,
      );
    }

    for (const lq of listeningWordQuestions) {
      pushQuestion(
        'listening',
        'Nghe',
        'listening',
        lq.question,
        lq.answer,
        shuffle(lq.options),
        lq.lessonNumber,
        lq.audioText,
      );
    }

    for (const lq of listeningSentenceQuestions) {
      pushQuestion(
        'listening',
        'Nghe',
        'listening',
        lq.question,
        lq.answer,
        shuffle(lq.options),
        lq.lessonNumber,
        lq.audioText,
      );
    }

    const examId = randomUUID();
    const session: MockExamSession = {
      examId,
      level,
      title: cfg.title,
      durationMinutes: cfg.durationMinutes,
      startedAt: new Date().toISOString(),
      questions,
      answerKey,
    };

    await this.cacheManager.set(sessionKey(examId), session, SESSION_TTL_MS);

    return {
      examId,
      level,
      title: cfg.title,
      durationMinutes: cfg.durationMinutes,
      totalQuestions: questions.length,
      sections: this.groupBySection(questions),
      questions,
    };
  }

  async submit(
    examId: string,
    answers: Record<string, string>,
    userId?: number,
  ) {
    const session = await this.cacheManager.get<MockExamSession>(
      sessionKey(examId),
    );
    if (!session) {
      throw new RpcException({
        statusCode: 404,
        message: 'Phiên thi không tồn tại hoặc đã hết hạn. Hãy bắt đầu đề mới.',
      });
    }

    const review: MockExamReviewItem[] = session.questions.map((q) => {
      const correctAnswer = session.answerKey[q.id] ?? '';
      const userAnswer = answers[q.id] ?? '';
      const isCorrect =
        normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
      return {
        ...q,
        correctAnswer,
        userAnswer,
        isCorrect,
      };
    });

    const correctCount = review.filter((r) => r.isCorrect).length;
    const total = review.length;
    const percent = total ? Math.round((correctCount / total) * 100) : 0;
    const passThreshold = session.level === 'n5' ? 60 : 65;
    const passed = percent >= passThreshold;

    const sectionScores = ['vocab', 'grammar', 'kanji', 'listening'].map(
      (sectionId) => {
        const items = review.filter((r) => r.sectionId === sectionId);
        const sectionCorrect = items.filter((r) => r.isCorrect).length;
        return {
          sectionId,
          sectionName: items[0]?.sectionName ?? sectionId,
          correct: sectionCorrect,
          total: items.length,
        };
      },
    );

    await this.cacheManager.del(sessionKey(examId));

    const submittedAt = new Date();

    await this.prisma.examResult.create({
      data: {
        userId: userId ?? null,
        examId,
        level: session.level,
        title: session.title,
        correctCount,
        total,
        percent,
        passed,
        submittedAt,
        sectionResults: {
          create: sectionScores.map((section) => ({
            section: section.sectionId,
            correct: section.correct,
            total: section.total,
            percent: section.total
              ? Math.round((section.correct / section.total) * 100)
              : 0,
          })),
        },
      },
    });

    return {
      examId,
      level: session.level,
      title: session.title,
      correctCount,
      total,
      percent,
      passThreshold,
      passed,
      sectionScores,
      review,
      submittedAt: submittedAt.toISOString(),
    };
  }

  getHistory(userId: number) {
    return this.prisma.examResult.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    });
  }

  private buildKanjiQuestions(
    picked: Array<{
      character: string;
      meaningVi: string;
      onyomi: string | null;
      kunyomi: string | null;
      lesson: { lessonNumber: number };
    }>,
    pool: Array<{ character: string; meaningVi: string }>,
  ) {
    return picked.map((entry) => {
      const distractors = sample(
        pool.filter((k) => k.character !== entry.character),
        3,
      ).map((k) => k.meaningVi);

      const options = [...distractors, entry.meaningVi];
      return {
        question: `Kanji 「${entry.character}」 có nghĩa tiếng Việt là gì?`,
        answer: entry.meaningVi,
        options,
        lessonNumber: entry.lesson.lessonNumber,
      };
    });
  }

  private groupBySection(questions: MockExamQuestionPublic[]) {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const q of questions) {
      const existing = map.get(q.sectionId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(q.sectionId, {
          id: q.sectionId,
          name: q.sectionName,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }

  private buildVocabListeningQuestions(
    picked: Array<{
      kana: string;
      meaning: string;
      lesson: { lessonNumber: number };
    }>,
    pool: Array<{ kana: string; meaning: string }>,
  ) {
    return picked.map((entry) => {
      const distractors = sample(
        pool.filter(
          (v) => v.kana !== entry.kana && v.meaning !== entry.meaning,
        ),
        3,
      ).map((v) => v.meaning);

      return {
        question: 'Nghe từ vựng và chọn nghĩa tiếng Việt đúng.',
        answer: entry.meaning,
        options: [...distractors, entry.meaning],
        audioText: entry.kana,
        lessonNumber: entry.lesson.lessonNumber,
      };
    });
  }

  private buildSentenceListeningQuestions(
    picked: Array<{ jp: string; vi: string; lessonNumber: number }>,
    pool: Array<{ jp: string; vi: string }>,
  ) {
    return picked.map((entry) => {
      const distractors = sample(
        pool.filter((e) => e.jp !== entry.jp && e.vi !== entry.vi),
        3,
      ).map((e) => e.vi);

      return {
        question: 'Nghe câu tiếng Nhật và chọn nghĩa tiếng Việt đúng.',
        answer: entry.vi,
        options: [...distractors, entry.vi],
        audioText: speechTextFromJapanese(entry.jp),
        lessonNumber: entry.lessonNumber,
      };
    });
  }
}
