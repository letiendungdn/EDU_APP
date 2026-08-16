import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import {
  CONJ_FORMS,
  conjugateWord,
  normalizeTypedJp,
  type ConjFormId,
} from '../../core/utils/conjugate';
import type { VocabularyWithLesson } from '../../core/models/api.models';

type Item = {
  kana: string;
  display: string;
  meaning: string;
  asked: ConjFormId;
  answer: string;
  options: string[];
};

function pickAsked(): ConjFormId {
  const pool: ConjFormId[] = ['te', 'ta', 'nai', 'dict'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildItems(rows: VocabularyWithLesson[]): Item[] {
  const items: Item[] = [];
  for (const row of rows) {
    const result = conjugateWord(row);
    if (!result) continue;
    const asked = pickAsked();
    const answer = result.forms[asked];
    const distractors = CONJ_FORMS.map((f) => result.forms[f.id]).filter((f) => f !== answer);
    const extra = items.map((i) => i.answer).filter((a) => a !== answer);
    const options = [answer, ...distractors, ...extra].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    items.push({
      kana: row.kana,
      display: row.kanji || row.kana,
      meaning: row.meaning,
      asked,
      answer,
      options,
    });
  }
  return items.sort(() => Math.random() - 0.5).slice(0, 20);
}

@Component({
  selector: 'app-conjugation-page',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './drills.scss',
  templateUrl: './conjugation-page.component.html',
})
export class ConjugationPageComponent {
  private readonly api = inject(ApiService);
  readonly loading = signal(true);
  readonly deck = signal<Item[]>([]);
  readonly index = signal(0);
  readonly picked = signal<string | null>(null);
  readonly typed = signal('');
  readonly score = signal({ ok: 0, n: 0 });
  readonly mode = signal<'choice' | 'type'>('choice');

  readonly current = computed(() => this.deck()[this.index()]);
  readonly askedLabel = computed(
    () => CONJ_FORMS.find((f) => f.id === this.current()?.asked)?.label ?? '',
  );

  constructor() {
    void this.api.getVocabulariesRange(1, 50).then((rows) => {
      this.deck.set(buildItems(rows));
      this.loading.set(false);
    });
  }

  grade(value: string): void {
    const current = this.current();
    if (!current || this.picked()) return;
    const ok = normalizeTypedJp(value) === normalizeTypedJp(current.answer);
    this.picked.set(value);
    this.score.update((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
  }

  next(): void {
    this.picked.set(null);
    this.typed.set('');
    this.index.update((i) => (i + 1) % Math.max(this.deck().length, 1));
  }

  speak(): void {
    const current = this.current();
    if (current) playJapanese(current.kana);
  }

  isCorrect(opt: string): boolean {
    return this.picked() != null && opt === this.current()?.answer;
  }

  optionClass(opt: string): string {
    if (this.picked() == null) return '';
    if (opt === this.current()?.answer) return ' is-correct';
    if (opt === this.picked()) return ' is-wrong';
    return '';
  }

  typedOk(): boolean {
    const current = this.current();
    const picked = this.picked();
    if (!current || !picked) return false;
    return normalizeTypedJp(picked) === normalizeTypedJp(current.answer);
  }
}
