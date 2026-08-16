import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { collectKanjiWords, readingChoices } from '../../core/utils/kanjiInWord';
import { playJapanese } from '../../core/utils/speech.util';
import type { KanjiEntry } from '../../core/models/api.models';

@Component({
  selector: 'app-kanji-readings-page',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './drills.scss',
  template: `
    <div class="container drill-view">
      <header class="drill-header">
        <h2 class="view-title">Kanji đọc trong từ</h2>
        <p class="drill-subtitle">Chọn cách đọc đúng của chữ trong từ đó. <a routerLink="/practice">Tất cả bài luyện</a></p>
      </header>
      <div class="drill-toolbar">
        <button type="button" class="tab-btn" [class.active]="level() === 'N5'" (click)="setLevel('N5')">N5</button>
        <button type="button" class="tab-btn" [class.active]="level() === 'N4'" (click)="setLevel('N4')">N4</button>
      </div>
      @if (loading()) {
        <p>Đang tải kanji...</p>
      } @else if (!current()) {
        <p>Chưa có từ vựng gắn kanji.</p>
      } @else {
        <p class="drill-score">{{ index() + 1 }}/{{ bank().length }} · đúng {{ score().ok }}/{{ score().n || 0 }}</p>
        <div class="drill-card">
          <p class="drill-meta">{{ current()!.meaningVi }}</p>
          <p class="drill-prompt japanese-text">{{ current()!.word }}</p>
          <p class="drill-meta">Chữ {{ current()!.character }} trong từ này đọc thế nào?</p>
          <div class="drill-options">
            @for (opt of options(); track opt) {
              <button type="button" class="drill-option japanese-text{{ optionClass(opt) }}" [disabled]="picked() != null" (click)="grade(opt)">{{ opt }}</button>
            }
          </div>
          @if (picked()) {
            <button type="button" class="btn btn-outline btn-sm" style="margin-top: 12px" (click)="speak()">Nghe</button>
          }
        </div>
        <button type="button" class="btn btn-nav" (click)="next()">Câu tiếp</button>
      }
    </div>
  `,
})
export class KanjiReadingsPageComponent {
  private readonly api = inject(ApiService);
  readonly loading = signal(true);
  readonly entries = signal<KanjiEntry[]>([]);
  readonly level = signal<'N5' | 'N4'>('N5');
  readonly index = signal(0);
  readonly picked = signal<string | null>(null);
  readonly score = signal({ ok: 0, n: 0 });

  readonly bank = computed(() => collectKanjiWords(this.entries()));
  readonly current = computed(() => this.bank()[this.index()]);
  readonly options = computed(() => {
    const current = this.current();
    return current ? readingChoices(current, this.bank()) : [];
  });
  readonly answer = computed(() => this.current()?.reading.replace(/-/g, '') ?? '');

  constructor() {
    void this.load('N5');
  }

  setLevel(level: 'N5' | 'N4'): void {
    this.level.set(level);
    this.index.set(0);
    this.picked.set(null);
    void this.load(level);
  }

  grade(opt: string): void {
    const current = this.current();
    if (!current || this.picked()) return;
    this.picked.set(opt);
    this.score.update((s) => ({ ok: s.ok + (opt === this.answer() ? 1 : 0), n: s.n + 1 }));
  }

  next(): void {
    this.picked.set(null);
    this.index.update((i) => (i + 1) % Math.max(this.bank().length, 1));
  }

  speak(): void {
    playJapanese(this.answer());
  }

  optionClass(opt: string): string {
    if (this.picked() == null) return '';
    if (opt === this.answer()) return ' is-correct';
    if (opt === this.picked()) return ' is-wrong';
    return '';
  }

  private async load(level: string): Promise<void> {
    this.loading.set(true);
    this.entries.set(await this.api.getKanjiByJlpt(level));
    this.loading.set(false);
  }
}
