import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import type { JlptLevel, KanjiEntry, KanjiLesson } from '../../core/models/api.models';
import { JLPT_LEVELS } from '../../core/models/api.models';

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
    if (count === 0) hint = 'Chưa có dữ liệu kanji cho cấp này trong hệ thống.';
    else if (lessonNumbers.length === 1) hint = `Bài ${lessonNumbers[0]} — ${count} kanji.`;
    else hint = `Bài ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]} — ${count} kanji.`;
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
    entry.lesson?.lessonNumber != null ? `bài ${entry.lesson.lessonNumber}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

@Component({
  selector: 'app-kanji-list-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './kanji-list-page.component.html',
  styleUrl: './kanji-list-page.component.scss',
})
export class KanjiListPageComponent {
  private readonly api = inject(ApiService);

  readonly jlptLevels = JLPT_LEVELS;
  readonly activeLevel = signal<JlptLevel>('N5');
  readonly searchInput = signal('');
  readonly lessons = signal<KanjiLesson[]>([]);
  readonly entriesCache = signal<Record<JlptLevel, KanjiEntry[]>>({
    N5: [],
    N4: [],
    N3: [],
    N2: [],
    N1: [],
  });
  readonly loading = signal(false);

  readonly summary = computed(() => buildJlptSummary(this.lessons()));
  readonly totalKanji = computed(() => this.summary().reduce((sum, item) => sum + item.count, 0));

  readonly filteredEntries = computed(() => {
    const level = this.activeLevel();
    const list = this.entriesCache()[level] ?? [];
    return list.filter((entry) => matchesSearch(entry, this.searchInput()));
  });

  readonly activeMeta = computed(
    () => this.summary().find((item) => item.level === this.activeLevel()) ?? this.summary()[0],
  );

  readonly displayCount = computed(() => {
    const level = this.activeLevel();
    return (this.entriesCache()[level] ?? []).length;
  });

  constructor() {
    void this.api.getKanjiLessons().then((data) => this.lessons.set(data));

    effect(() => {
      void this.loadLevel(this.activeLevel());
    });
  }

  setLevel(level: JlptLevel): void {
    this.activeLevel.set(level);
    this.searchInput.set('');
  }

  onSearch(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  speak(entry: KanjiEntry): void {
    const raw = entry.onyomi || entry.kunyomi || entry.character;
    const reading = raw.split(/[,、]/)[0].replace(/-.*/, '').trim();
    playJapanese(reading);
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
