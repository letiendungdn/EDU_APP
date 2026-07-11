import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { playJapanese } from '../../core/utils/speech.util';
import {
  loadMistakeWords,
  saveMistakeWords,
  type MistakeWord,
} from '../../core/utils/mistake-vocab.util';
import type { ReviewLogItem } from '../../core/models/api.models';

const DAILY_REVIEW_LIMIT = 20;

function wordKey(w: MistakeWord): string {
  return `${w.lessonNumber}:${w.kana}`;
}

@Component({
  selector: 'app-vocab-review-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vocab-review-page.component.html',
  styleUrl: './vocab-review-page.component.scss',
})
export class VocabReviewPageComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly tab = signal<'review' | 'bank'>('review');
  readonly bank = signal<MistakeWord[]>(loadMistakeWords());
  readonly sessionActive = signal(false);
  readonly queue = signal<MistakeWord[]>([]);
  readonly index = signal(0);
  readonly revealed = signal(false);
  readonly sessionDone = signal(false);
  readonly rememberedCount = signal(0);

  readonly stats = computed(() => {
    const words = this.bank();
    return {
      total: words.length,
      dailyGoal: DAILY_REVIEW_LIMIT,
      dueToday: Math.min(DAILY_REVIEW_LIMIT, words.length),
    };
  });

  readonly current = computed(() => {
    const q = this.queue();
    const i = this.index();
    return q[i] ?? null;
  });

  readonly progressLabel = computed(() => {
    const q = this.queue();
    if (!this.sessionActive() || !q.length) return '';
    return `Từ ${this.index() + 1} / ${q.length}`;
  });

  constructor() {
    effect(() => {
      const token = this.auth.token();
      if (!token || !this.auth.authReady()) return;
      void this.api.getReviewProgress(token).then((items) => this.mergeServerProgress(items));
    });
  }

  refresh(): void {
    this.bank.set(loadMistakeWords());
  }

  switchTab(next: 'review' | 'bank'): void {
    this.tab.set(next);
    if (next === 'bank') this.refresh();
  }

  startReview(): void {
    const batch = this.pickReviewBatch();
    if (!batch.length) return;
    this.queue.set(batch);
    this.index.set(0);
    this.revealed.set(false);
    this.sessionDone.set(false);
    this.rememberedCount.set(0);
    this.sessionActive.set(true);
  }

  toggleReveal(): void {
    if (!this.revealed()) this.revealed.set(true);
  }

  speak(event: Event): void {
    event.stopPropagation();
    const w = this.current();
    if (w?.kana) playJapanese(w.kana);
  }

  finishCard(remembered: boolean): void {
    const current = this.current();
    if (!current) return;

    const key = wordKey(current);
    const list = [...loadMistakeWords()];
    const idx = list.findIndex((w) => wordKey(w) === key);

    if (remembered) {
      this.rememberedCount.update((n) => n + 1);
      if (idx >= 0) list.splice(idx, 1);
    } else if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        wrongCount: list[idx].wrongCount + 1,
        lastWrongAt: new Date().toISOString(),
      };
    }

    saveMistakeWords(list);
    this.bank.set(list);
    void this.syncToServer(list);

    if (this.index() + 1 >= this.queue().length) {
      this.sessionActive.set(false);
      this.sessionDone.set(true);
      this.refresh();
      return;
    }

    this.index.update((i) => i + 1);
    this.revealed.set(false);
  }

  removeWord(word: MistakeWord): void {
    const key = wordKey(word);
    const next = loadMistakeWords().filter((w) => wordKey(w) !== key);
    saveMistakeWords(next);
    this.bank.set(next);
    void this.syncToServer(next);
  }

  private pickReviewBatch(): MistakeWord[] {
    return [...loadMistakeWords()]
      .sort((a, b) => {
        const aTime = a.lastWrongAt ? new Date(a.lastWrongAt).getTime() : 0;
        const bTime = b.lastWrongAt ? new Date(b.lastWrongAt).getTime() : 0;
        return aTime - bTime || b.wrongCount - a.wrongCount;
      })
      .slice(0, DAILY_REVIEW_LIMIT);
  }

  private mergeServerProgress(items: ReviewLogItem[]): void {
    if (!items.length) return;
    const local = loadMistakeWords();
    const map = new Map(local.map((w) => [wordKey(w), w]));

    for (const item of items) {
      if (item.mastered) continue;
      const key = `${item.lessonNumber}:${item.kana}`;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          wrongCount: Math.max(existing.wrongCount, item.wrongCount),
          meaning: item.meaning || existing.meaning,
          kanji: item.kanji ?? existing.kanji,
        });
      } else {
        map.set(key, {
          kana: item.kana,
          kanji: item.kanji,
          meaning: item.meaning,
          lessonNumber: item.lessonNumber,
          wrongCount: item.wrongCount,
          lastWrongAt: item.lastReviewedAt ?? new Date().toISOString(),
        });
      }
    }

    const merged = [...map.values()];
    saveMistakeWords(merged);
    this.bank.set(merged);
  }

  private async syncToServer(words: MistakeWord[]): Promise<void> {
    const token = this.auth.token();
    if (!token) return;

    const items: ReviewLogItem[] = words.map((w) => ({
      kana: w.kana,
      kanji: w.kanji,
      meaning: w.meaning,
      lessonNumber: w.lessonNumber,
      wrongCount: w.wrongCount,
      reviewStreak: 0,
      mastered: false,
      lastReviewedAt: w.lastWrongAt,
    }));

    try {
      await this.api.syncReviewProgress(token, items);
    } catch {
      /* localStorage vẫn là source of truth khi offline */
    }
  }
}
