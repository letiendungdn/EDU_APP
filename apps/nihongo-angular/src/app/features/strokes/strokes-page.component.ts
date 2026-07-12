import { Component, computed, effect, inject, signal } from '@angular/core';
import { StrokeOrderComponent } from '../../shared/stroke-order/stroke-order.component';
import { ApiService } from '../../core/services/api.service';
import {
  flashcardPhraseStrokeScale,
  getStrokeText,
  hasOptionalBracketParts,
  isRomajiInput,
  parseOptionalBracketSegments,
  type OptionalBracketSegment,
} from '../../core/utils/japanese.util';
import { playJapanese } from '../../core/utils/speech.util';

const EXAMPLES = ['私', '医者', 'watashi', 'arigatou', 'よろしく', '［どうぞ］よろしく', '日本語'] as const;

type RomajiForm = 'kana' | 'kanji';

interface KanaRomajiLookup {
  text: string;
  kana: string;
  romaji: string;
  kanji: string | null;
  meaning: string | null;
}

interface RomajiConversion {
  romaji: string;
  kana: string;
  kanji: string | null;
  meaning: string | null;
  options: Array<{ kind: RomajiForm; text: string }>;
}

function lookupStrokeSize(charCount: number, totalChars: number, optional = false): number {
  const denseBase =
    charCount <= 1 ? 120 : charCount <= 2 ? 96 : charCount <= 4 ? 78 : charCount <= 8 ? 64 : 52;
  const scaled = Math.round(denseBase * flashcardPhraseStrokeScale(totalChars));
  return optional ? Math.max(32, Math.round(scaled * 0.55)) : Math.max(36, scaled);
}

@Component({
  selector: 'app-strokes-page',
  standalone: true,
  imports: [StrokeOrderComponent],
  templateUrl: './strokes-page.component.html',
  styleUrl: './strokes-page.component.scss',
})
export class StrokesPageComponent {
  private readonly api = inject(ApiService);

  readonly examples = EXAMPLES;
  readonly input = signal('私');
  readonly reading = signal<KanaRomajiLookup | null>(null);
  readonly readingLoading = signal(false);
  readonly romajiConversion = signal<RomajiConversion | null>(null);
  readonly romajiForm = signal<RomajiForm>('kanji');
  readonly romajiLoading = signal(false);

  readonly isRomaji = computed(() => isRomajiInput(this.input()));

  readonly effectiveText = computed(() => {
    if (!this.isRomaji()) return this.input();
    const conversion = this.romajiConversion();
    if (!conversion?.kana) return '';
    if (this.romajiForm() === 'kanji' && conversion.kanji) return conversion.kanji;
    return conversion.kana;
  });

  readonly strokeText = computed(() => getStrokeText(this.effectiveText()));
  readonly hasOptional = computed(() => hasOptionalBracketParts(this.effectiveText()));
  readonly segments = computed(() => parseOptionalBracketSegments(this.effectiveText()));
  readonly totalChars = computed(() =>
    this.segments().reduce(
      (sum, segment) => sum + [...getStrokeText(segment.text)].length,
      0,
    ),
  );
  readonly singleSize = computed(() =>
    lookupStrokeSize(this.totalChars() || 1, this.totalChars() || 1),
  );
  readonly displayKanji = computed(() => {
    const lookup = this.reading();
    if (!lookup?.kanji || lookup.kanji === lookup.kana) return null;
    return lookup.kanji;
  });
  readonly showRomajiToggle = computed(
    () => this.isRomaji() && (this.romajiConversion()?.options.length ?? 0) > 1,
  );
  readonly previewText = computed(() => this.effectiveText().trim() || this.input().trim());

  constructor() {
    effect((onCleanup) => {
      const query = this.input().trim();
      if (!query || !isRomajiInput(query)) {
        this.romajiConversion.set(null);
        this.romajiLoading.set(false);
        return;
      }

      this.romajiLoading.set(true);
      const timer = setTimeout(() => {
        this.api
          .fetchRomajiConversion(query)
          .then((result) => {
            this.romajiConversion.set(result);
            this.romajiForm.set(result.kanji ? 'kanji' : 'kana');
          })
          .catch(() => this.romajiConversion.set(null))
          .finally(() => this.romajiLoading.set(false));
      }, 280);

      onCleanup(() => clearTimeout(timer));
    });

    effect((onCleanup) => {
      const query = this.effectiveText().trim();
      if (!query || !getStrokeText(query)) {
        this.reading.set(null);
        this.readingLoading.set(false);
        return;
      }

      this.readingLoading.set(true);
      const timer = setTimeout(() => {
        this.api
          .fetchKanaRomajiLookup(query)
          .then((result) => this.reading.set(result))
          .catch(() => this.reading.set(null))
          .finally(() => this.readingLoading.set(false));
      }, 280);

      onCleanup(() => clearTimeout(timer));
    });
  }

  setInput(value: string): void {
    this.input.set(value);
  }

  setRomajiForm(form: RomajiForm): void {
    this.romajiForm.set(form);
  }

  isRomajiExample(example: string): boolean {
    return isRomajiInput(example);
  }

  segmentStrokeText(segment: OptionalBracketSegment): string {
    return getStrokeText(segment.text);
  }

  segmentSize(segment: OptionalBracketSegment, optional: boolean): number {
    const count = [...getStrokeText(segment.text)].length;
    return lookupStrokeSize(count, this.totalChars(), optional);
  }

  speak(): void {
    const text = this.reading()?.kana || this.strokeText();
    if (text) playJapanese(text);
  }
}
