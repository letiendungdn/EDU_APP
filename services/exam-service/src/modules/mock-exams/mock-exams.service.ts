import { Inject, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import type { ExerciseType, MockExamTemplate } from "@prisma/client";
import {
  REDIS_CLIENT,
  sample,
  shuffle,
  speechTextFromJapanese,
  normalizeAnswer,
} from "@app/common";
import type {
  CreateMockExamTemplateDto,
  UpdateMockExamTemplateDto,
} from "@app/contracts";
import { PrismaService } from "@app/prisma";
import type Redis from "ioredis";
import { randomUUID } from "crypto";

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const sessionKey = (examId: string) => `mock-exam:${examId}`;

function exerciseOptions(exercise: { options?: { text: string }[] }): string[] {
  return exercise.options?.map((o) => o.text) ?? [];
}

function toQuestionType(
  type: ExerciseType,
): "multiple_choice" | "fill_in_blank" {
  return type === "MULTIPLE_CHOICE" ? "multiple_choice" : "fill_in_blank";
}

export type MockExamLevel = "n5" | "n4" | "n3" | "n2" | "n1";

export interface MockExamQuestionPublic {
  id: string;
  sectionId: string;
  sectionName: string;
  type: "multiple_choice" | "fill_in_blank" | "listening";
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

export interface MockExamSession {
  examId: string;
  templateId: number;
  templateSlug: string;
  level: MockExamLevel;
  title: string;
  durationMinutes: number;
  passThreshold: number;
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
  passThreshold: number;
  description: string;
}

function templateToConfig(row: MockExamTemplate): LevelConfig {
  return {
    title: row.title,
    durationMinutes: row.durationMinutes,
    lessonFrom: row.lessonFrom,
    lessonTo: row.lessonTo,
    kanjiLessonFrom: row.kanjiLessonFrom,
    kanjiLessonTo: row.kanjiLessonTo,
    vocabCount: row.vocabCount,
    grammarCount: row.grammarCount,
    kanjiCount: row.kanjiCount,
    listeningWordCount: row.listeningWordCount,
    listeningSentenceCount: row.listeningSentenceCount,
    passThreshold: row.passThreshold,
    description: row.description,
  };
}

function totalQuestions(row: Pick<
  MockExamTemplate,
  | "vocabCount"
  | "grammarCount"
  | "kanjiCount"
  | "listeningWordCount"
  | "listeningSentenceCount"
>) {
  return (
    row.vocabCount +
    row.grammarCount +
    row.kanjiCount +
    row.listeningWordCount +
    row.listeningSentenceCount
  );
}

function resolveScope(row: MockExamTemplate): string {
  if (row.scope.trim()) return row.scope;
  if (row.lessonFrom <= 50 && row.lessonTo <= 50) {
    return `Minna Bài ${row.lessonFrom}–${row.lessonTo}`;
  }
  return `Bộ ${row.level.toUpperCase()} trong app`;
}

function toListItem(row: MockExamTemplate) {
  return {
    id: row.id,
    slug: row.slug,
    level: row.level,
    title: row.title,
    durationMinutes: row.durationMinutes,
    totalQuestions: totalQuestions(row),
    lessonRange: `${row.lessonFrom}–${row.lessonTo}`,
    scope: resolveScope(row),
    description: row.description,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
  };
}

function toAdminItem(row: MockExamTemplate) {
  return {
    ...toListItem(row),
    lessonFrom: row.lessonFrom,
    lessonTo: row.lessonTo,
    kanjiLessonFrom: row.kanjiLessonFrom,
    kanjiLessonTo: row.kanjiLessonTo,
    vocabCount: row.vocabCount,
    grammarCount: row.grammarCount,
    kanjiCount: row.kanjiCount,
    listeningWordCount: row.listeningWordCount,
    listeningSentenceCount: row.listeningSentenceCount,
    passThreshold: row.passThreshold,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

@Injectable()
export class MockExamsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async listTemplates() {
    const rows = await this.prisma.mockExamTemplate.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return rows.map(toListItem);
  }

  async listTemplatesAdmin() {
    const rows = await this.prisma.mockExamTemplate.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return rows.map(toAdminItem);
  }

  async getTemplate(id: number) {
    const row = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
    });
    if (!row) {
      throw new RpcException({
        statusCode: 404,
        message: "Không tìm thấy đề thi",
      });
    }
    return toAdminItem(row);
  }

  async createTemplate(dto: CreateMockExamTemplateDto) {
    const slug =
      dto.slug?.trim() ||
      `${dto.level}-${slugify(dto.title) || "de"}-${Date.now()}`;

    const existing = await this.prisma.mockExamTemplate.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: `Slug "${slug}" đã tồn tại`,
      });
    }

    const row = await this.prisma.mockExamTemplate.create({
      data: {
        slug,
        level: dto.level,
        title: dto.title,
        description: dto.description ?? "",
        durationMinutes: dto.durationMinutes,
        lessonFrom: dto.lessonFrom,
        lessonTo: dto.lessonTo,
        kanjiLessonFrom: dto.kanjiLessonFrom,
        kanjiLessonTo: dto.kanjiLessonTo,
        vocabCount: dto.vocabCount ?? 12,
        grammarCount: dto.grammarCount ?? 10,
        kanjiCount: dto.kanjiCount ?? 5,
        listeningWordCount: dto.listeningWordCount ?? 4,
        listeningSentenceCount: dto.listeningSentenceCount ?? 4,
        passThreshold: dto.passThreshold ?? 65,
        scope: dto.scope ?? "",
        isPublished: dto.isPublished ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return toAdminItem(row);
  }

  async updateTemplate(id: number, dto: UpdateMockExamTemplateDto) {
    const current = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
    });
    if (!current) {
      throw new RpcException({
        statusCode: 404,
        message: "Không tìm thấy đề thi",
      });
    }

    if (dto.slug && dto.slug !== current.slug) {
      const taken = await this.prisma.mockExamTemplate.findUnique({
        where: { slug: dto.slug },
      });
      if (taken) {
        throw new RpcException({
          statusCode: 409,
          message: `Slug "${dto.slug}" đã tồn tại`,
        });
      }
    }

    const row = await this.prisma.mockExamTemplate.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.durationMinutes !== undefined
          ? { durationMinutes: dto.durationMinutes }
          : {}),
        ...(dto.lessonFrom !== undefined ? { lessonFrom: dto.lessonFrom } : {}),
        ...(dto.lessonTo !== undefined ? { lessonTo: dto.lessonTo } : {}),
        ...(dto.kanjiLessonFrom !== undefined
          ? { kanjiLessonFrom: dto.kanjiLessonFrom }
          : {}),
        ...(dto.kanjiLessonTo !== undefined
          ? { kanjiLessonTo: dto.kanjiLessonTo }
          : {}),
        ...(dto.vocabCount !== undefined ? { vocabCount: dto.vocabCount } : {}),
        ...(dto.grammarCount !== undefined
          ? { grammarCount: dto.grammarCount }
          : {}),
        ...(dto.kanjiCount !== undefined ? { kanjiCount: dto.kanjiCount } : {}),
        ...(dto.listeningWordCount !== undefined
          ? { listeningWordCount: dto.listeningWordCount }
          : {}),
        ...(dto.listeningSentenceCount !== undefined
          ? { listeningSentenceCount: dto.listeningSentenceCount }
          : {}),
        ...(dto.passThreshold !== undefined
          ? { passThreshold: dto.passThreshold }
          : {}),
        ...(dto.scope !== undefined ? { scope: dto.scope } : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return toAdminItem(row);
  }

  async deleteTemplate(id: number) {
    const current = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
    });
    if (!current) {
      throw new RpcException({
        statusCode: 404,
        message: "Không tìm thấy đề thi",
      });
    }

    await this.prisma.mockExamTemplate.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async findTemplateByKey(key: string) {
    const numericId = Number(key);
    if (Number.isInteger(numericId) && numericId > 0) {
      const byId = await this.prisma.mockExamTemplate.findUnique({
        where: { id: numericId },
      });
      if (byId) return byId;
    }

    return this.prisma.mockExamTemplate.findUnique({
      where: { slug: key.toLowerCase() },
    });
  }

  async start(key: string) {
    const template = await this.findTemplateByKey(key);
    if (!template) {
      throw new RpcException({
        statusCode: 404,
        message: `Đề thi "${key}" không tồn tại`,
      });
    }
    if (!template.isPublished) {
      throw new RpcException({
        statusCode: 404,
        message: "Đề thi chưa được công bố",
      });
    }

    const cfg = templateToConfig(template);
    const level = template.level as MockExamLevel;

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
          include: { options: { orderBy: { sortOrder: "asc" } } },
        })
      : [];

    const vocabPool = exercises.filter((e) => e.type === "MULTIPLE_CHOICE");
    const grammarPool = exercises.filter(
      (e) => e.type === "MULTIPLE_CHOICE" || e.type === "FILL_IN_BLANK",
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
      type: "multiple_choice" | "fill_in_blank" | "listening",
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
        "vocab",
        "Từ vựng",
        "multiple_choice",
        ex.question,
        ex.answer,
        shuffle(exerciseOptions(ex)),
        lessonById.get(ex.lessonId),
      );
    }

    for (const ex of pickedGrammar) {
      const type = toQuestionType(ex.type);
      pushQuestion(
        "grammar",
        "Ngữ pháp",
        type,
        ex.question,
        ex.answer,
        type === "multiple_choice" ? shuffle(exerciseOptions(ex)) : undefined,
        lessonById.get(ex.lessonId),
      );
    }

    for (const kq of kanjiQuestions) {
      pushQuestion(
        "kanji",
        "Kanji",
        "multiple_choice",
        kq.question,
        kq.answer,
        shuffle(kq.options),
        kq.lessonNumber,
      );
    }

    for (const lq of listeningWordQuestions) {
      pushQuestion(
        "listening",
        "Nghe",
        "listening",
        lq.question,
        lq.answer,
        shuffle(lq.options),
        lq.lessonNumber,
        lq.audioText,
      );
    }

    for (const lq of listeningSentenceQuestions) {
      pushQuestion(
        "listening",
        "Nghe",
        "listening",
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
      templateId: template.id,
      templateSlug: template.slug,
      level,
      title: cfg.title,
      durationMinutes: cfg.durationMinutes,
      passThreshold: cfg.passThreshold,
      startedAt: new Date().toISOString(),
      questions,
      answerKey,
    };

    await this.cacheManager.set(sessionKey(examId), session, SESSION_TTL_MS);

    return {
      examId,
      templateId: template.id,
      slug: template.slug,
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
        message: "Phiên thi không tồn tại hoặc đã hết hạn. Hãy bắt đầu đề mới.",
      });
    }

    const review: MockExamReviewItem[] = session.questions.map((q) => {
      const correctAnswer = session.answerKey[q.id] ?? "";
      const userAnswer = answers[q.id] ?? "";
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
    const passThreshold = session.passThreshold ?? 65;
    const passed = percent >= passThreshold;

    const sectionScores = ["vocab", "grammar", "kanji", "listening"].map(
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
    let runningScore = 0;

    if (userId) {
      for (let i = 0; i < review.length; i += 1) {
        if (review[i].isCorrect) runningScore += 1;
        await this.redis.publish(
          "exam:question-scored",
          JSON.stringify({
            userId,
            examResultId: 0,
            questionIndex: i,
            correct: review[i].isCorrect,
            score: runningScore,
          }),
        );
      }
    }

    const examResult = await this.prisma.examResult.create({
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
        sections: {
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

    if (userId) {
      await this.redis.publish(
        "exam:completed",
        JSON.stringify({
          userId,
          examResultId: examResult.id,
          totalScore: correctCount,
          passed,
          percent,
        }),
      );
    }

    return {
      examId,
      level: session.level,
      slug: session.templateSlug,
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
      orderBy: { submittedAt: "desc" },
      take: 20,
    });
  }

  getSession(examId: string) {
    return this.cacheManager.get<MockExamSession>(sessionKey(examId));
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
        question: "Nghe từ vựng và chọn nghĩa tiếng Việt đúng.",
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
        question: "Nghe câu tiếng Nhật và chọn nghĩa tiếng Việt đúng.",
        answer: entry.vi,
        options: [...distractors, entry.vi],
        audioText: speechTextFromJapanese(entry.jp),
        lessonNumber: entry.lessonNumber,
      };
    });
  }
}
