import { Component, computed, input } from '@angular/core';
import {
  hasOptionalBracketParts,
  parseOptionalBracketSegments,
} from '../../core/utils/japanese.util';

@Component({
  selector: 'app-flashcard-japanese-text',
  standalone: true,
  template: `
    <span
      [attr.class]="
        'flashcard-jp-text' +
        (hasOptional() ? ' flashcard-jp-text--optional-mix' : '') +
        (extraClass() ? ' ' + extraClass() : '')
      "
    >
      @for (segment of segments(); track $index) {
        @if (segment.optional) {
          <span class="flashcard-jp-optional">
            <span class="flashcard-jp-bracket">{{ segment.openBracket ?? '[' }}</span>
            {{ segment.text }}
            <span class="flashcard-jp-bracket">{{ segment.closeBracket ?? ']' }}</span>
          </span>
        } @else {
          <span class="flashcard-jp-core">{{ segment.text }}</span>
        }
      }
    </span>
  `,
})
export class FlashcardJapaneseTextComponent {
  readonly text = input.required<string>();
  readonly extraClass = input('', { alias: 'className' });

  readonly segments = computed(() => parseOptionalBracketSegments(this.text()));
  readonly hasOptional = computed(() => hasOptionalBracketParts(this.text()));
}
