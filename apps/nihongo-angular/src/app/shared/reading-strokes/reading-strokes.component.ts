import { Component, input, output } from '@angular/core';
import { StrokeOrderComponent } from '../stroke-order/stroke-order.component';
import {
  flashcardStrokeBoxSize,
  getStrokeText,
  parseReadingVariants,
  shouldShowKanaStroke,
  strokeBoxSize,
} from '../../core/utils/japanese.util';

@Component({
  selector: 'app-reading-strokes',
  standalone: true,
  imports: [StrokeOrderComponent],
  template: `
    @if (showDual()) {
      <div class="stroke-dual" [class.stroke-dual--flashcard]="flashcard()">
        <div class="stroke-block" (click)="$event.stopPropagation()">
          @if (kanji()) {
            <p class="stroke-label">Kanji</p>
            <app-stroke-order
              [text]="kanji()!"
              [width]="kanjiSize()"
              [height]="kanjiSize()"
              [compact]="true"
              (charClick)="charClick.emit($event)"
            />
          }
        </div>
        <div class="stroke-block" (click)="$event.stopPropagation()">
          <p class="stroke-label">Kana</p>
          <app-stroke-order
            [text]="kana()"
            [width]="kanaSize()"
            [height]="kanaSize()"
            [compact]="true"
            (charClick)="charClick.emit($event)"
          />
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
      <div class="stroke-block" (click)="$event.stopPropagation()">
        <app-stroke-order
          [text]="kanji() || kana()"
          [width]="singleSize()"
          [height]="singleSize()"
          [compact]="true"
          (charClick)="charClick.emit($event)"
        />
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

  readonly getStrokeText = getStrokeText;

  textSize(text: string): number {
    const count = [...getStrokeText(text)].length;
    return this.flashcard() ? flashcardStrokeBoxSize(count) : strokeBoxSize(count, true);
  }

  showDual(): boolean {
    return shouldShowKanaStroke(this.kanji(), this.kana());
  }

  hasVariants(): boolean {
    return parseReadingVariants(this.kana(), this.romaji()).length > 1;
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
