import { LowerCasePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { getKanjiSpeakItems } from '../../core/utils/kanji-speak';
import type { JlptLevel, KanjiEntry, KanjiLesson } from '../../core/models/api.models';
import { JLPT_LEVELS } from '../../core/models/api.models';

type ViewLevel = JlptLevel | 'ALL';
type DisplayMode = 'grid' | 'table';

interface JlptSummary {
  level: JlptLevel;
  count: number;
  hint: string;
  hasData: boolean;
}

function buildJlptSummary(lessons: KanjiLesson[]): JlptSummary[] {
  const buckets = new Map<JlptLevel, { count: number; lessonNumbers: number[] }>(
    JLPT_LEVELS.map((level) => [level, { count: 0, lessonNumbers: [] }]),
  );

  for (const lesson of lessons) {
    const level = lesson.jlptLevel as JlptLevel | null;
    if (!level || !buckets.has(level)) continue;
    const bucket = buckets.get(level)!;
    bucket.count += lesson._count?.entries ?? 0;
    bucket.lessonNumbers.push(lesson.lessonNumber);
  }

  return JLPT_LEVELS.map((level) => {
    const { count, lessonNumbers } = buckets.get(level)!;
    lessonNumbers.sort((a, b) => a - b);
    let hint: string;
    if (count === 0) hint = 'Chưa có dữ liệu';
    else if (lessonNumbers.length === 1) hint = `Bài ${lessonNumbers[0]}`;
    else hint = `Bài ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]}`;
    return { level, count, hint, hasData: count > 0 };
  });
}

function matchesSearch(entry: KanjiEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    entry.character,
    entry.hanViet,
    entry.onyomi,
    entry.kunyomi,
    entry.meaningVi,
    entry.jlptLevel,
    entry.lesson?.jlptLevel,
    entry.lesson?.lessonNumber != null ? `bài ${entry.lesson.lessonNumber}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function getEntryJlpt(entry: KanjiEntry): string {
  return entry.jlptLevel ?? entry.lesson?.jlptLevel ?? '—';
}

@Component({
  selector: 'app-kanji-list-page',
  standalone: true,
  imports: [RouterLink, LowerCasePipe],
  templateUrl: './kanji-list-page.component.html',
  styleUrl: './kanji-list-page.component.scss',
})
export class KanjiListPageComponent {
  private readonly api = inject(ApiService);

  readonly jlptLevels = JLPT_LEVELS;
  readonly activeLevel = signal<ViewLevel>('ALL');
  readonly searchInput = signal('');
  readonly displayMode = signal<DisplayMode>('grid');
  readonly selectedEntry = signal<KanjiEntry | null>(null);
  readonly lessons = signal<KanjiLesson[]>([]);
  readonly entriesCache = signal<Record<JlptLevel, KanjiEntry[]>>({
    N5: [],
    N4: [],
    N3: [],
    N2: [],
    N1: [],
  });
  readonly loading = signal(false);
  readonly loadingAll = signal(false);

  readonly summary = computed(() => buildJlptSummary(this.lessons()));
  readonly totalKanji = computed(() => this.summary().reduce((sum, item) => sum + item.count, 0));
  readonly isAllView = computed(() => this.activeLevel() === 'ALL');

  readonly allEntries = computed(() =>
    JLPT_LEVELS.flatMap((level) => this.entriesCache()[level] ?? []),
  );

  readonly currentEntries = computed(() =>
    this.isAllView() ? this.allEntries() : (this.entriesCache()[this.activeLevel() as JlptLevel] ?? []),
  );

  readonly filteredEntries = computed(() =>
    this.currentEntries().filter((entry) => matchesSearch(entry, this.searchInput())),
  );

  readonly activeMeta = computed(() => {
    if (this.isAllView()) {
      const total = this.totalKanji();
      return {
        level: 'ALL' as const,
        count: total,
        hint: `Gộp ${JLPT_LEVELS.join(', ')} — ${total} kanji`,
        hasData: total > 0,
      };
    }
    return this.summary().find((item) => item.level === this.activeLevel()) ?? this.summary()[0];
  });

  constructor() {
    void this.api.getKanjiLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const level = this.activeLevel();
      if (level === 'ALL') {
        void this.loadAllLevels();
      } else {
        void this.loadLevel(level);
      }
    });
  }

  setLevel(level: ViewLevel): void {
    this.activeLevel.set(level);
    this.searchInput.set('');
    this.selectedEntry.set(null);
  }

  setDisplayMode(mode: DisplayMode): void {
    this.displayMode.set(mode);
  }

  selectEntry(entry: KanjiEntry): void {
    this.selectedEntry.set(entry);
    this.speak(entry);
  }

  entryTitle(entry: KanjiEntry): string {
    return [entry.hanViet, entry.onyomi, entry.kunyomi, entry.meaningVi].filter(Boolean).join(' · ');
  }

  onSearch(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  speak(entry: KanjiEntry): void {
    playJapanese(getKanjiSpeakItems(entry)[0] ?? entry.character);
  }

  entryJlpt(entry: KanjiEntry): string {
    return getEntryJlpt(entry);
  }

  private async loadAllLevels(): Promise<void> {
    const missing = JLPT_LEVELS.filter((level) => (this.entriesCache()[level] ?? []).length === 0);
    if (missing.length === 0) return;

    this.loadingAll.set(true);
    try {
      const results = await Promise.all(missing.map((level) => this.api.getKanjiByJlpt(level)));
      this.entriesCache.update((cache) => {
        const next = { ...cache };
        missing.forEach((level, index) => {
          next[level] = results[index] ?? [];
        });
        return next;
      });
    } finally {
      this.loadingAll.set(false);
    }
  }

  private async loadLevel(level: JlptLevel): Promise<void> {
    if ((this.entriesCache()[level] ?? []).length > 0) return;
    this.loading.set(true);
    try {
      const data = await this.api.getKanjiByJlpt(level);
      this.entriesCache.update((cache) => ({ ...cache, [level]: data }));
    } finally {
      this.loading.set(false);
    }
  }
}
