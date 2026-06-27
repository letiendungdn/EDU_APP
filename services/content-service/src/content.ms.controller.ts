import { Controller, OnModuleInit } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CONTENT_PATTERNS,
  CreateExerciseDto,
  CreateGrammarDto,
  CreateLessonDto,
  CreateVocabularyDto,
  UpdateExerciseDto,
  UpdateGrammarDto,
  UpdateLessonDto,
  UpdateVocabularyDto,
} from '@app/contracts';
import { handleGrpcDispatch, type PatternHandler } from '@app/common';
import { LessonsService } from './modules/lessons/lessons.service';
import { VocabulariesService } from './modules/vocabularies/vocabularies.service';
import { GrammarsService } from './modules/grammars/grammars.service';
import { ExercisesService } from './modules/exercises/exercises.service';
import { KanjiService } from './modules/kanji/kanji.service';
import { ListeningService } from './modules/listening/listening.service';
import { ImportService } from './modules/import/import.service';
import { ReferenceService } from './modules/reference/reference.service';
import { ReadingService } from './modules/reading/reading.service';

@Controller()
export class ContentMsController implements OnModuleInit {
  private routes!: Record<string, PatternHandler>;

  constructor(
    private readonly lessonsService: LessonsService,
    private readonly vocabulariesService: VocabulariesService,
    private readonly grammarsService: GrammarsService,
    private readonly exercisesService: ExercisesService,
    private readonly kanjiService: KanjiService,
    private readonly listeningService: ListeningService,
    private readonly importService: ImportService,
    private readonly referenceService: ReferenceService,
    private readonly readingService: ReadingService,
  ) {}

  onModuleInit() {
    this.routes = {
      [CONTENT_PATTERNS.GET_LESSONS]: () => this.getLessons(),
      [CONTENT_PATTERNS.GET_LESSON]: (data) =>
        this.getLesson(data as { lessonNumber: number }),
      [CONTENT_PATTERNS.CREATE_LESSON]: (dto) =>
        this.createLesson(dto as CreateLessonDto),
      [CONTENT_PATTERNS.UPDATE_LESSON]: (data) =>
        this.updateLesson(data as { id: number; dto: UpdateLessonDto }),
      [CONTENT_PATTERNS.DELETE_LESSON]: (data) =>
        this.deleteLesson(data as { id: number }),
      [CONTENT_PATTERNS.GET_VOCABULARIES]: (data) =>
        this.getVocabularies(
          data as { lessonNumber?: number; page?: number; limit?: number },
        ),
      [CONTENT_PATTERNS.GET_VOCABULARY]: (data) =>
        this.getVocabulary(data as { id: number }),
      [CONTENT_PATTERNS.CREATE_VOCABULARY]: (dto) =>
        this.createVocabulary(dto as CreateVocabularyDto),
      [CONTENT_PATTERNS.UPDATE_VOCABULARY]: (data) =>
        this.updateVocabulary(data as { id: number; dto: UpdateVocabularyDto }),
      [CONTENT_PATTERNS.DELETE_VOCABULARY]: (data) =>
        this.deleteVocabulary(data as { id: number }),
      [CONTENT_PATTERNS.GET_GRAMMARS]: (data) =>
        this.getGrammars(
          data as { lessonNumber?: number; page?: number; limit?: number },
        ),
      [CONTENT_PATTERNS.GET_GRAMMAR]: (data) =>
        this.getGrammar(data as { id: number }),
      [CONTENT_PATTERNS.CREATE_GRAMMAR]: (dto) =>
        this.createGrammar(dto as CreateGrammarDto),
      [CONTENT_PATTERNS.UPDATE_GRAMMAR]: (data) =>
        this.updateGrammar(data as { id: number; dto: UpdateGrammarDto }),
      [CONTENT_PATTERNS.DELETE_GRAMMAR]: (data) =>
        this.deleteGrammar(data as { id: number }),
      [CONTENT_PATTERNS.GET_EXERCISES]: (data) =>
        this.getExercises(data as { lessonNumber?: number }),
      [CONTENT_PATTERNS.GET_EXERCISE]: (data) =>
        this.getExercise(data as { id: number }),
      [CONTENT_PATTERNS.CREATE_EXERCISE]: (dto) =>
        this.createExercise(dto as CreateExerciseDto),
      [CONTENT_PATTERNS.UPDATE_EXERCISE]: (data) =>
        this.updateExercise(data as { id: number; dto: UpdateExerciseDto }),
      [CONTENT_PATTERNS.DELETE_EXERCISE]: (data) =>
        this.deleteExercise(data as { id: number }),
      [CONTENT_PATTERNS.GET_KANJI_LESSONS]: () => this.getKanjiLessons(),
      [CONTENT_PATTERNS.GET_KANJI_ENTRIES]: (data) =>
        this.getKanjiEntries(data as { lessonNumber?: number }),
      [CONTENT_PATTERNS.GET_KANJI_ENTRY]: (data) =>
        this.getKanjiEntry(data as { id: number }),
      [CONTENT_PATTERNS.GET_LISTENING_PLAYLIST]: (data) =>
        this.getListeningPlaylist(
          data as { lessonFrom: number; lessonTo: number; limit: number },
        ),
      [CONTENT_PATTERNS.IMPORT_VOCAB]: (data) =>
        this.importVocab(data as { lessonNumber: number; text: string }),
      [CONTENT_PATTERNS.GET_REFERENCE_LIST]: () => this.getReferenceList(),
      [CONTENT_PATTERNS.GET_REFERENCE]: (data) =>
        this.getReference(data as { slug: string }),
      [CONTENT_PATTERNS.GET_READING_PASSAGES]: (data) =>
        this.getReadingPassages(data as { jlptLevel?: string }),
      [CONTENT_PATTERNS.GET_READING_PASSAGE]: (data) =>
        this.getReadingPassage(data as { id: number }),
      [CONTENT_PATTERNS.SUBMIT_READING]: (data) =>
        this.submitReading(
          data as {
            passageId: number;
            answers: Record<string, string>;
            userId?: number;
          },
        ),
    };
  }

  @GrpcMethod('ContentService', 'Dispatch')
  dispatch(data: { pattern: string; payload: string }) {
    return handleGrpcDispatch(this.routes, data);
  }

  getLessons() {
    return this.lessonsService.findAll();
  }

  getLesson(data: { lessonNumber: number }) {
    return this.lessonsService.findOne(data.lessonNumber);
  }

  createLesson(dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  updateLesson(data: { id: number; dto: UpdateLessonDto }) {
    return this.lessonsService.update(data.id, data.dto);
  }

  deleteLesson(data: { id: number }) {
    return this.lessonsService.remove(data.id);
  }

  getVocabularies(data: {
    lessonNumber?: number;
    page?: number;
    limit?: number;
  }) {
    return this.vocabulariesService.findAll(
      data.lessonNumber,
      data.page,
      data.limit,
    );
  }

  getVocabulary(data: { id: number }) {
    return this.vocabulariesService.findOne(data.id);
  }

  createVocabulary(dto: CreateVocabularyDto) {
    return this.vocabulariesService.create(dto);
  }

  updateVocabulary(data: { id: number; dto: UpdateVocabularyDto }) {
    return this.vocabulariesService.update(data.id, data.dto);
  }

  deleteVocabulary(data: { id: number }) {
    return this.vocabulariesService.remove(data.id);
  }

  getGrammars(data: { lessonNumber?: number; page?: number; limit?: number }) {
    return this.grammarsService.findAll(
      data.lessonNumber,
      data.page,
      data.limit,
    );
  }

  getGrammar(data: { id: number }) {
    return this.grammarsService.findOne(data.id);
  }

  createGrammar(dto: CreateGrammarDto) {
    return this.grammarsService.create(dto);
  }

  updateGrammar(data: { id: number; dto: UpdateGrammarDto }) {
    return this.grammarsService.update(data.id, data.dto);
  }

  deleteGrammar(data: { id: number }) {
    return this.grammarsService.remove(data.id);
  }

  getExercises(data: { lessonNumber?: number }) {
    return this.exercisesService.findAll(data.lessonNumber);
  }

  getExercise(data: { id: number }) {
    return this.exercisesService.findOne(data.id);
  }

  createExercise(dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  updateExercise(data: { id: number; dto: UpdateExerciseDto }) {
    return this.exercisesService.update(data.id, data.dto);
  }

  deleteExercise(data: { id: number }) {
    return this.exercisesService.remove(data.id);
  }

  getKanjiLessons() {
    return this.kanjiService.findAllLessons();
  }

  getKanjiEntries(data: { lessonNumber?: number }) {
    return this.kanjiService.findEntries(data.lessonNumber);
  }

  getKanjiEntry(data: { id: number }) {
    return this.kanjiService.findOne(data.id);
  }

  getListeningPlaylist(data: {
    lessonFrom: number;
    lessonTo: number;
    limit: number;
  }) {
    return this.listeningService.getPlaylist(
      data.lessonFrom,
      data.lessonTo,
      data.limit,
    );
  }

  importVocab(data: { lessonNumber: number; text: string }) {
    return this.importService.importVocabFromText(data.lessonNumber, data.text);
  }

  getReferenceList() {
    return this.referenceService.findAll();
  }

  getReference(data: { slug: string }) {
    return this.referenceService.findBySlug(data.slug);
  }

  getReadingPassages(data: { jlptLevel?: string }) {
    return this.readingService.findAll(data.jlptLevel);
  }

  getReadingPassage(data: { id: number }) {
    return this.readingService.findOne(data.id);
  }

  submitReading(data: {
    passageId: number;
    answers: Record<string, string>;
    userId?: number;
  }) {
    return this.readingService.submit(
      data.passageId,
      data.answers,
      data.userId,
    );
  }
}
