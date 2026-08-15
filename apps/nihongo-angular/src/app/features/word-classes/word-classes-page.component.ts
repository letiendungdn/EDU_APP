import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { playJapanese } from '../../core/utils/speech.util';
import {
  WORD_CLASS_TABS,
  classifyMinnaWord,
  wordClassLabel,
  type MinnaWordClass,
  type WordClassTabId,
} from '../../core/utils/minna-word-class';
import type { Lesson, VocabularyWithLesson } from '../../core/models/api.models';

type ClassifiedWord = VocabularyWithLesson & {
  wordClass: MinnaWordClass;
};

type Draft = {
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  lessonId: number;
  partOfSpeech: MinnaWordClass;
};

const HINTS: Record<WordClassTabId, string> = {
  noun: 'Danh từ (名詞) — người, đồ vật, chỗ, thời gian. Nhiều từ Minna hết い vẫn là danh từ: 学生・世界・先生.',
  'i-adj': 'Tính từ い (い形容詞) — chia trực tiếp: 高い → 高くない / 高かった. Bấm thẻ để nghe.',
  'na-adj': 'Tính từ な (な形容詞) — trong sách ghi ［な］: 静かな町, きれいな花. Trước です không thêm な.',
  verb: 'Động từ Minna học ở dạng ます (丁寧形). 食べます・行きます・結婚します đều vào nhóm này.',
  other: 'Câu chào, phó từ, hậu tố đếm (～回・－歳), mẫu ～さん… — không xếp vào danh / tính / động từ.',
};

function emptyDraft(partOfSpeech: MinnaWordClass, lessonId: number): Draft {
  return { kanji: '', kana: '', romaji: '', meaning: '', lessonId, partOfSpeech };
}

@Component({
  selector: 'app-word-classes-page',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './word-classes-page.component.html',
  styleUrl: './word-classes-page.component.scss',
})
export class WordClassesPageComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly tabs = WORD_CLASS_TABS;
  readonly activeId = signal<WordClassTabId>('noun');
  readonly searchQuery = signal('');
  readonly classified = signal<ClassifiedWord[]>([]);
  readonly lessons = signal<Lesson[]>([]);
  readonly editMode = signal(false);
  readonly adding = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly draft = signal<Draft>(emptyDraft('noun', 0));
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly canEdit = computed(() => this.auth.isAdmin() && this.editMode());
  readonly lessonOptions = computed(() =>
    this.lessons().filter((lesson) => lesson.lessonNumber >= 1 && lesson.lessonNumber <= 50),
  );

  readonly counts = computed(() => {
    const next: Record<MinnaWordClass, number> = {
      noun: 0,
      'i-adj': 0,
      'na-adj': 0,
      verb: 0,
      other: 0,
    };
    for (const item of this.classified()) next[item.wordClass] += 1;
    return next;
  });

  readonly items = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const active = this.activeId();
    return this.classified().filter((item) => {
      if (item.wordClass !== active) return false;
      if (!q) return true;
      return [item.kanji, item.kana, item.romaji, item.meaning, `bài ${item.lessonNumber}`]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  readonly hint = computed(() => HINTS[this.activeId()]);
  readonly classLabel = computed(() => wordClassLabel(this.activeId()));

  constructor() {
    void Promise.all([this.api.getVocabulariesRange(1, 50), this.api.getLessons()]).then(
      ([list, lessons]) => {
        this.classified.set(list.map((entry) => ({ ...entry, wordClass: classifyMinnaWord(entry) })));
        this.lessons.set(lessons);
        this.loading.set(false);
      },
    );
  }

  setTab(id: WordClassTabId): void {
    this.activeId.set(id);
    this.adding.set(false);
    this.editingId.set(null);
  }

  speak(kana: string): void {
    playJapanese(kana);
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
      this.draft.set(emptyDraft(this.activeId(), this.lessonOptions()[0]?.id ?? 0));
      this.error.set(null);
      return true;
    });
  }

  startEdit(item: ClassifiedWord): void {
    this.adding.set(false);
    this.editingId.set(item.id);
    this.draft.set({
      kanji: item.kanji ?? '',
      kana: item.kana,
      romaji: item.romaji,
      meaning: item.meaning,
      lessonId: item.lessonId ?? 0,
      partOfSpeech: item.wordClass,
    });
    this.error.set(null);
  }

  patchDraft(partial: Partial<Draft>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  cancelForm(): void {
    this.adding.set(false);
    this.editingId.set(null);
  }

  async saveEdit(): Promise<void> {
    const token = this.auth.token();
    const id = this.editingId();
    if (!token || id == null) return;
    const next = this.validateDraft();
    if (!next) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.updateVocabulary(token, id, {
        kanji: next.kanji || null,
        kana: next.kana,
        romaji: next.romaji,
        meaning: next.meaning,
        lessonId: next.lessonId,
        partOfSpeech: next.partOfSpeech,
      });
      this.editingId.set(null);
      if (next.partOfSpeech !== this.activeId()) this.activeId.set(next.partOfSpeech);
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
    const next = this.validateDraft();
    if (!next) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.createVocabulary(token, {
        lessonId: next.lessonId,
        kana: next.kana,
        romaji: next.romaji,
        meaning: next.meaning,
        partOfSpeech: next.partOfSpeech,
        ...(next.kanji ? { kanji: next.kanji } : {}),
      });
      this.adding.set(false);
      if (next.partOfSpeech !== this.activeId()) this.activeId.set(next.partOfSpeech);
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
    if (!window.confirm('Xóa từ này? Từ cũng mất ở trang Từ vựng / flashcard.')) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.deleteVocabulary(token, id);
      if (this.editingId() === id) this.editingId.set(null);
      await this.reload();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không xóa được');
    } finally {
      this.busy.set(false);
    }
  }

  private validateDraft(): Draft | null {
    const current = this.draft();
    const kana = current.kana.trim();
    const romaji = current.romaji.trim();
    const meaning = current.meaning.trim();
    const kanji = current.kanji.trim();
    if (!kana || !romaji || !meaning) {
      this.error.set('Điền đủ kana, romaji và nghĩa');
      return null;
    }
    if (!current.lessonId) {
      this.error.set('Chọn bài học');
      return null;
    }
    return { ...current, kana, romaji, meaning, kanji };
  }

  private async reload(): Promise<void> {
    const list = await this.api.getVocabulariesRange(1, 50);
    this.classified.set(list.map((entry) => ({ ...entry, wordClass: classifyMinnaWord(entry) })));
  }
}
