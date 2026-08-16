import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  grammarQuickAnalysis,
  grammarUsageBullets,
  parseGrammarExplanation,
} from '../../core/utils/grammar.util';
import {
  grammarExampleRomaji,
  grammarExampleSpeechText,
} from '../../core/utils/grammar-example.util';
import { playSpeech } from '../../core/utils/speech.util';
import { isGrammarPinned, pinGrammar, unpinGrammar } from '../../core/utils/grammarSrs';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import { FuriganaTextComponent } from '../../shared/furigana-text/furigana-text.component';
import type { Grammar, Lesson } from '../../core/models/api.models';

type ExampleDraft = { jp: string; romaji: string; vi: string };
type GrammarDraft = {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: ExampleDraft[];
};

function emptyExample(): ExampleDraft {
  return { jp: '', romaji: '', vi: '' };
}

function emptyDraft(): GrammarDraft {
  return { pattern: '', meaning: '', explanation: '', examples: [emptyExample()] };
}

@Component({
  selector: 'app-grammar-page',
  standalone: true,
  imports: [LessonSelectorComponent, NgTemplateOutlet, FuriganaTextComponent, RouterLink],
  templateUrl: './grammar-page.component.html',
  styleUrl: './grammar-page.component.scss',
})
export class GrammarPageComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly lesson = signal(1);
  readonly lessons = signal<Lesson[]>([]);
  readonly grammars = signal<Grammar[]>([]);
  readonly editMode = signal(false);
  readonly adding = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly draft = signal<GrammarDraft>(emptyDraft());
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly showFuri = signal(true);
  readonly pinTick = signal(0);

  readonly hasData = computed(() => this.grammars().length > 0);
  readonly canEdit = computed(() => this.auth.isAdmin() && this.editMode());
  readonly lessonId = computed(
    () => this.lessons().find((item) => item.lessonNumber === this.lesson())?.id ?? null,
  );

  readonly parseExplanation = parseGrammarExplanation;
  readonly usageBullets = grammarUsageBullets;
  readonly quickAnalysis = grammarQuickAnalysis;
  readonly exampleRomaji = grammarExampleRomaji;

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      void this.api.getGrammars(n).then((list) => this.grammars.set(list));
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
    this.adding.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  speak(text: string, event: Event): void {
    event.stopPropagation();
    playSpeech(grammarExampleSpeechText(text), 'ja-JP');
  }

  isPinned(id: number): boolean {
    return this.pinTick() >= 0 && isGrammarPinned(id);
  }

  togglePin(grammar: Grammar): void {
    if (isGrammarPinned(grammar.id)) unpinGrammar(grammar.id);
    else {
      pinGrammar({
        id: grammar.id,
        pattern: grammar.pattern,
        meaning: grammar.meaning,
        lessonNumber: this.lesson(),
      });
    }
    this.pinTick.update((n) => n + 1);
  }

  toggleEditMode(): void {
    this.editMode.update((on) => {
      if (on) {
        this.adding.set(false);
        this.editingId.set(null);
        this.error.set(null);
      }
      return !on;
    });
  }

  startAdd(): void {
    this.editingId.set(null);
    this.adding.update((on) => {
      if (on) return false;
      this.draft.set(emptyDraft());
      this.error.set(null);
      return true;
    });
  }

  startEdit(grammar: Grammar): void {
    this.adding.set(false);
    this.editingId.set(grammar.id);
    const examples = (grammar.examples ?? []).map((example) => ({
      jp: example.jp,
      romaji: example.romaji ?? '',
      vi: example.vi ?? example.en ?? '',
    }));
    this.draft.set({
      pattern: grammar.pattern,
      meaning: grammar.meaning,
      explanation: grammar.explanation ?? '',
      examples: examples.length ? examples : [emptyExample()],
    });
    this.error.set(null);
  }

  patchDraft(partial: Partial<Omit<GrammarDraft, 'examples'>>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  patchExample(index: number, partial: Partial<ExampleDraft>): void {
    this.draft.update((current) => ({
      ...current,
      examples: current.examples.map((example, i) =>
        i === index ? { ...example, ...partial } : example,
      ),
    }));
  }

  addExampleRow(): void {
    this.draft.update((current) => ({
      ...current,
      examples: [...current.examples, emptyExample()],
    }));
  }

  removeExampleRow(index: number): void {
    this.draft.update((current) => ({
      ...current,
      examples:
        current.examples.length <= 1
          ? [emptyExample()]
          : current.examples.filter((_, i) => i !== index),
    }));
  }

  cancelForm(): void {
    this.adding.set(false);
    this.editingId.set(null);
  }

  async saveEdit(): Promise<void> {
    const token = this.auth.token();
    const id = this.editingId();
    if (!token || id == null) return;
    const payload = this.payloadFromDraft();
    if (!payload) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.updateGrammar(token, id, payload);
      this.editingId.set(null);
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không lưu được');
    } finally {
      this.busy.set(false);
    }
  }

  async handleAdd(): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    const payload = this.payloadFromDraft();
    if (!payload) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.createGrammar(token, payload);
      this.adding.set(false);
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không thêm được');
    } finally {
      this.busy.set(false);
    }
  }

  async handleDelete(id: number): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    if (!window.confirm('Xóa mục ngữ pháp này?')) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.deleteGrammar(token, id);
      if (this.editingId() === id) this.editingId.set(null);
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không xóa được');
    } finally {
      this.busy.set(false);
    }
  }

  private payloadFromDraft() {
    const current = this.draft();
    const pattern = current.pattern.trim();
    const meaning = current.meaning.trim();
    const explanation = current.explanation.trim();
    const lessonId = this.lessonId();
    if (!pattern || !meaning) {
      this.error.set('Điền đủ mẫu ngữ pháp và ý nghĩa');
      return null;
    }
    if (lessonId == null) {
      this.error.set('Không xác định được bài học');
      return null;
    }
    return {
      lessonId,
      pattern,
      meaning,
      explanation: explanation || null,
      examples: current.examples
        .map((example) => ({
          jp: example.jp.trim(),
          romaji: example.romaji.trim(),
          vi: example.vi.trim() || null,
        }))
        .filter((example) => example.jp),
    };
  }

  private async reload(): Promise<void> {
    const list = await this.api.getGrammars(this.lesson());
    this.grammars.set(list);
    const lessons = await this.api.getLessons();
    this.lessons.set(lessons);
  }
}
