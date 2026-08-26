import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { resolvePictureVocabImage } from '../../core/utils/vocab-image.util';
import { flashcardTextTier, hasOptionalBracketParts } from '../../core/utils/japanese.util';
import { getVocabExamples } from '../../core/utils/vocab-pattern-example';
import { FlashcardJapaneseTextComponent } from '../../shared/flashcard-japanese-text/flashcard-japanese-text.component';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import { ReadingStrokesComponent } from '../../shared/reading-strokes/reading-strokes.component';
import type { Lesson, Vocabulary } from '../../core/models/api.models';

function matchesVocabSearch(vocab: Vocabulary, query: string): boolean {
  const haystack = [vocab.kanji, vocab.kana, vocab.romaji, vocab.meaning]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

@Component({
  selector: 'app-vocab-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LessonSelectorComponent,
    ReadingStrokesComponent,
    FlashcardJapaneseTextComponent,
  ],
  templateUrl: './vocab-page.component.html',
  styleUrl: './vocab-page.component.scss',
})
export class VocabPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly index = signal(0);
  readonly flipped = signal(false);
  readonly searchQuery = signal('');
  readonly playingAll = signal(false);
  readonly lessons = signal<Lesson[]>([]);
  readonly vocabList = signal<Vocabulary[]>([]);

  readonly current = computed(() => {
    const list = this.vocabList();
    if (!list.length) return null;
    return list[this.index() % list.length];
  });

  readonly currentPicture = computed(() => {
    const vocab = this.current();
    return vocab ? resolvePictureVocabImage(vocab) : null;
  });

  readonly frontTextTierClass = computed(() => {
    const vocab = this.current();
    if (!vocab) return '';
    const tier = flashcardTextTier(vocab.kanji, vocab.kana);
    const tierClass = tier === 'sm' ? '' : ` flashcard-text-dual--tier-${tier}`;
    const optionalClass =
      hasOptionalBracketParts(vocab.kanji) ||
      hasOptionalBracketParts(vocab.kana) ||
      hasOptionalBracketParts(vocab.romaji)
        ? ' flashcard-text-dual--optional-brackets'
        : '';
    return `${tierClass}${optionalClass}`;
  });

  readonly hasOptionalBrackets = computed(() => {
    const vocab = this.current();
    if (!vocab) return false;
    return (
      hasOptionalBracketParts(vocab.kanji) ||
      hasOptionalBracketParts(vocab.kana) ||
      hasOptionalBracketParts(vocab.romaji)
    );
  });

  readonly patternExamples = computed(() => {
    const vocab = this.current();
    return vocab ? getVocabExamples(vocab) : [];
  });

  readonly filteredVocab = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.vocabList();
    if (!query) {
      return list.map((vocab, vocabIndex) => ({ vocab, index: vocabIndex }));
    }
    return list
      .map((vocab, vocabIndex) => ({ vocab, index: vocabIndex }))
      .filter(({ vocab }) => matchesVocabSearch(vocab, query));
  });

  readonly progressWidth = computed(() => {
    const total = this.vocabList().length;
    if (!total) return '0%';
    return `${((this.index() + 1) / total) * 100}%`;
  });

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      void this.api.getVocabularies(n).then((list) => this.vocabList.set(list));
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
    this.index.set(0);
    this.flipped.set(false);
    this.searchQuery.set('');
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  selectWord(wordIndex: number): void {
    this.index.set(wordIndex);
    this.flipped.set(false);
  }

  toggleFlip(): void {
    this.flipped.update((v) => !v);
  }

  next(): void {
    const len = this.vocabList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.vocabList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i - 1 + len) % len);
  }

  speak(text?: string, event?: Event): void {
    event?.stopPropagation();
    const v = this.current();
    if (v) playJapanese(text ?? v.kana);
  }

  speakExample(text: string, event?: Event): void {
    event?.stopPropagation();
    playJapanese(text);
  }

  onStrokeCharClick(): void {
    this.speak();
  }

  async playAll(): Promise<void> {
    if (this.playingAll()) return;
    const list = this.vocabList();
    if (!list.length) return;

    this.playingAll.set(true);
    try {
      for (const vocab of list) {
        playJapanese(vocab.kana);
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      }
    } finally {
      this.playingAll.set(false);
    }
  }
}
