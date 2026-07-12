import { Component, input, output } from '@angular/core';
import { StrokeOrderComponent } from '../stroke-order/stroke-order.component';
import {
  flashcardSegmentStrokeSize,
  flashcardStrokeBoxSize,
  getStrokeText,
  hasOptionalBracketParts,
  optionalBracketStrokeCharCount,
  parseOptionalBracketSegments,
  parseReadingVariants,
  shouldShowKanaStroke,
  strokeBoxSize,
  type OptionalBracketSegment,
} from '../../core/utils/japanese.util';

@Component({
  selector: 'app-reading-strokes',
  standalone: true,
  imports: [StrokeOrderComponent],
  template: `
    @if (showDualOnBack()) {
      <div class="stroke-dual" [class.stroke-dual--flashcard]="flashcard()">
        @if (kanji()) {
          <div
            class="stroke-block"
            [class.flashcard-stroke-block--optional-mix]="showOptionalFlashcard(kanji())"
            (click)="$event.stopPropagation()"
          >
            <p class="stroke-label">Kanji</p>
            @if (showOptionalFlashcard(kanji())) {
              <div class="flashcard-stroke-segments">
                @for (segment of segments(kanji()!); track $index) {
                  @if (segmentStrokeText(segment)) {
                    @if (segment.optional) {
                      <span class="flashcard-stroke-optional-wrap">
                        <span class="flashcard-jp-bracket">{{ segment.openBracket ?? '[' }}</span>
                        <app-stroke-order
                          [text]="segment.text"
                          [width]="segmentSize(segment, true, kanji()!)"
                          [height]="segmentSize(segment, true, kanji()!)"
                          [compact]="true"
                          (charClick)="charClick.emit($event)"
                        />
                        <span class="flashcard-jp-bracket">{{ segment.closeBracket ?? ']' }}</span>
                      </span>
                    } @else {
                      <span class="flashcard-stroke-core-wrap">
                        <app-stroke-order
                          [text]="segment.text"
                          [width]="segmentSize(segment, false, kanji()!)"
                          [height]="segmentSize(segment, false, kanji()!)"
                          [compact]="true"
                          (charClick)="charClick.emit($event)"
                        />
                      </span>
                    }
                  } @else if (segment.text.trim()) {
                    <span class="flashcard-stroke-punct">{{ segment.text }}</span>
                  }
                }
              </div>
            } @else {
              <app-stroke-order
                [text]="kanji()!"
                [width]="kanjiSize()"
                [height]="kanjiSize()"
                [compact]="true"
                (charClick)="charClick.emit($event)"
              />
            }
          </div>
        }
        <div
          class="stroke-block"
          [class.flashcard-stroke-block--optional-mix]="showOptionalFlashcard(kana())"
          (click)="$event.stopPropagation()"
        >
          <p class="stroke-label">Kana</p>
          @if (showOptionalFlashcard(kana())) {
            <div class="flashcard-stroke-segments">
              @for (segment of segments(kana()); track $index) {
                @if (segmentStrokeText(segment)) {
                  @if (segment.optional) {
                    <span class="flashcard-stroke-optional-wrap">
                      <span class="flashcard-jp-bracket">{{ segment.openBracket ?? '[' }}</span>
                      <app-stroke-order
                        [text]="segment.text"
                        [width]="segmentSize(segment, true, kana())"
                        [height]="segmentSize(segment, true, kana())"
                        [compact]="true"
                        (charClick)="charClick.emit($event)"
                      />
                      <span class="flashcard-jp-bracket">{{ segment.closeBracket ?? ']' }}</span>
                    </span>
                  } @else {
                    <span class="flashcard-stroke-core-wrap">
                      <app-stroke-order
                        [text]="segment.text"
                        [width]="segmentSize(segment, false, kana())"
                        [height]="segmentSize(segment, false, kana())"
                        [compact]="true"
                        (charClick)="charClick.emit($event)"
                      />
                    </span>
                  }
                } @else if (segment.text.trim()) {
                  <span class="flashcard-stroke-punct">{{ segment.text }}</span>
                }
              }
            </div>
          } @else {
            <app-stroke-order
              [text]="kana()"
              [width]="kanaSize()"
              [height]="kanaSize()"
              [compact]="true"
              (charClick)="charClick.emit($event)"
            />
          }
        </div>
      </div>
    } @else if (hasVariants()) {
      <div class="stroke-pairs">
        @for (pair of pairs(); track $index) {
          <div class="stroke-pair">
            @if (pair.label) {
              <p class="stroke-label">{{ pair.label }}</p>
            }
            <div class="stroke-pair-row" (click)="$event.stopPropagation()">
              @if (pair.kanjiText) {
                <div class="stroke-block">
                  <app-stroke-order
                    [text]="pair.kanjiText"
                    [width]="textSize(pair.kanjiText)"
                    [height]="textSize(pair.kanjiText)"
                    [compact]="true"
                    (charClick)="charClick.emit($event)"
                  />
                </div>
              }
              @if (pair.kanaText) {
                <div class="stroke-block">
                  <app-stroke-order
                    [text]="pair.kanaText"
                    [width]="textSize(pair.kanaText)"
                    [height]="textSize(pair.kanaText)"
                    [compact]="true"
                    (charClick)="charClick.emit($event)"
                  />
                </div>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div
        class="stroke-block"
        [class.flashcard-stroke-block--optional-mix]="showOptionalFlashcard(kanji() || kana())"
        (click)="$event.stopPropagation()"
      >
        @if (showOptionalFlashcard(kanji() || kana())) {
          <div class="flashcard-stroke-segments">
            @for (segment of segments(kanji() || kana()); track $index) {
              @if (segmentStrokeText(segment)) {
                @if (segment.optional) {
                  <span class="flashcard-stroke-optional-wrap">
                    <span class="flashcard-jp-bracket">{{ segment.openBracket ?? '[' }}</span>
                    <app-stroke-order
                      [text]="segment.text"
                      [width]="segmentSize(segment, true, kanji() || kana())"
                      [height]="segmentSize(segment, true, kanji() || kana())"
                      [compact]="true"
                      (charClick)="charClick.emit($event)"
                    />
                    <span class="flashcard-jp-bracket">{{ segment.closeBracket ?? ']' }}</span>
                  </span>
                } @else {
                  <span class="flashcard-stroke-core-wrap">
                    <app-stroke-order
                      [text]="segment.text"
                      [width]="segmentSize(segment, false, kanji() || kana())"
                      [height]="segmentSize(segment, false, kanji() || kana())"
                      [compact]="true"
                      (charClick)="charClick.emit($event)"
                    />
                  </span>
                }
              } @else if (segment.text.trim()) {
                <span class="flashcard-stroke-punct">{{ segment.text }}</span>
              }
            }
          </div>
        } @else {
          <app-stroke-order
            [text]="kanji() || kana()"
            [width]="singleSize()"
            [height]="singleSize()"
            [compact]="true"
            (charClick)="charClick.emit($event)"
          />
        }
      </div>
    }
  `,
  styleUrl: './reading-strokes.component.scss',
  host: {
    '[class.reading-strokes--flashcard]': 'flashcard()',
  },
})
export class ReadingStrokesComponent {
  readonly kanji = input<string | null>(null);
  readonly kana = input.required<string>();
  readonly romaji = input('');
  readonly flashcard = input(false);
  readonly charClick = output<string>();

  textSize(text: string): number {
    const count = [...getStrokeText(text)].length;
    return this.flashcard() ? flashcardStrokeBoxSize(count) : strokeBoxSize(count, true);
  }

  showDual(): boolean {
    return shouldShowKanaStroke(this.kanji(), this.kana());
  }

  hasOptionalFlashcardBack(): boolean {
    return Boolean(
      this.flashcard() &&
        (hasOptionalBracketParts(this.kanji()) || hasOptionalBracketParts(this.kana())),
    );
  }

  showDualOnBack(): boolean {
    return this.showDual() && !this.hasOptionalFlashcardBack();
  }

  hasVariants(): boolean {
    return parseReadingVariants(this.kana(), this.romaji()).length > 1;
  }

  showOptionalFlashcard(text: string | null | undefined): boolean {
    return Boolean(this.flashcard() && text && hasOptionalBracketParts(text));
  }

  segments(text: string): OptionalBracketSegment[] {
    return parseOptionalBracketSegments(text);
  }

  segmentStrokeText(segment: OptionalBracketSegment): string {
    return getStrokeText(segment.text);
  }

  segmentSize(segment: OptionalBracketSegment, optional: boolean, sourceText: string): number {
    const count = [...getStrokeText(segment.text)].length;
    if (this.flashcard()) {
      return flashcardSegmentStrokeSize(count, optional, optionalBracketStrokeCharCount(sourceText));
    }
    const base = strokeBoxSize(count, true);
    return optional ? Math.max(40, Math.round(base * 0.62)) : base;
  }

  kanjiSize(): number {
    const t = this.kanji() ?? '';
    const count = [...getStrokeText(t)].length;
    return this.flashcard() ? flashcardStrokeBoxSize(count) : strokeBoxSize(count, true);
  }

  kanaSize(): number {
    const count = [...getStrokeText(this.kana())].length;
    return this.flashcard() ? flashcardStrokeBoxSize(count) : strokeBoxSize(count, true);
  }

  singleSize(): number {
    const t = getStrokeText(this.kanji() ?? this.kana());
    const count = [...t].length;
    return this.flashcard() ? flashcardStrokeBoxSize(count) : strokeBoxSize(count, true);
  }

  pairs(): Array<{ label?: string; kanjiText?: string; kanaText?: string }> {
    const showDual = this.showDual();
    const kanaVariants = parseReadingVariants(this.kana(), this.romaji());
    const kanjiVariants = this.kanji() ? parseReadingVariants(this.kanji()!, this.romaji()) : [];
    const pairCount = showDual
      ? Math.max(kanjiVariants.length, kanaVariants.length, 1)
      : kanaVariants.length;

    return Array.from({ length: pairCount }, (_, index) => ({
      label: kanaVariants[index]?.label ?? kanjiVariants[index]?.label,
      kanjiText: showDual ? kanjiVariants[index]?.text : undefined,
      kanaText: kanaVariants[index]?.text,
    }));
  }
}
