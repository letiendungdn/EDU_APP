import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { getStrokeText } from '../../core/utils/japanese.util';
import { renderStrokeOrder } from '../../core/utils/stroke-order.util';

@Component({
  selector: 'app-stroke-order',
  standalone: true,
  template: `
    <div class="stroke-order-wrapper">
      <div #container class="stroke-order-container" title="Nhấn vào chữ để xem lại nét vẽ"></div>
      @if (writableText() && !compact()) {
        <p class="stroke-hint">Nhấn vào chữ để xem lại nét vẽ</p>
      }
    </div>
  `,
  styleUrl: './stroke-order.component.scss',
})
export class StrokeOrderComponent implements AfterViewInit, OnDestroy {
  readonly text = input.required<string>();
  readonly width = input(100);
  readonly height = input(100);
  readonly compact = input(false);
  readonly charClick = output<string>();

  @ViewChild('container', { static: true }) private containerRef!: ElementRef<HTMLDivElement>;

  readonly writableText = computed(() => getStrokeText(this.text()));

  private readonly viewReady = signal(false);
  private renderToken = 0;

  constructor() {
    effect(() => {
      if (!this.viewReady()) return;
      const t = this.writableText();
      const w = this.width();
      const h = this.height();
      void this.render(t, w, h);
    });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  ngOnDestroy(): void {
    this.renderToken += 1;
  }

  private async render(text: string, width: number, height: number): Promise<void> {
    const token = ++this.renderToken;
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    await renderStrokeOrder(container, text, width, height, (char) => {
      this.charClick.emit(char);
    });

    if (token !== this.renderToken) {
      container.innerHTML = '';
    }
  }
}
