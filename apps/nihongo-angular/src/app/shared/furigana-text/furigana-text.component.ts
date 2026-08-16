import { Component, Input } from '@angular/core';
import { renderFuriganaParts, stripParenFurigana } from '../../core/utils/furiganaDisplay';

type FuriPart = { kanji: string; reading?: string } | { text: string };

@Component({
  selector: 'app-furigana-text',
  standalone: true,
  template: `
    @if (!show) {
      <span>{{ stripped }}</span>
    } @else {
      @for (part of parts; track $index) {
        @if (rubyOf(part); as ruby) {
          <ruby>{{ ruby.kanji }}<rt>{{ ruby.reading }}</rt></ruby>
        } @else {
          <span>{{ textOf(part) }}</span>
        }
      }
    }
  `,
})
export class FuriganaTextComponent {
  @Input({ required: true }) text = '';
  @Input() show = true;

  get parts(): FuriPart[] {
    return renderFuriganaParts(this.text);
  }

  get stripped(): string {
    return stripParenFurigana(this.text);
  }

  rubyOf(part: FuriPart): { kanji: string; reading: string } | null {
    if ('reading' in part && part.reading) return { kanji: part.kanji, reading: part.reading };
    return null;
  }

  textOf(part: FuriPart): string {
    return 'text' in part ? part.text : part.kanji;
  }
}
