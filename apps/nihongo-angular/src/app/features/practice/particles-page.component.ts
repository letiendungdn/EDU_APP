import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { buildParticleQuestions } from '../../core/utils/particles';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import { FuriganaTextComponent } from '../../shared/furigana-text/furigana-text.component';
import type { Grammar, Lesson } from '../../core/models/api.models';

@Component({
  selector: 'app-particles-page',
  standalone: true,
  imports: [RouterLink, LessonSelectorComponent, FuriganaTextComponent],
  styleUrl: './drills.scss',
  template: `
    <div class="container drill-view">
      <header class="drill-header">
        <h2 class="view-title">助詞 — Luyện trợ từ</h2>
        <p class="drill-subtitle">Che は/が/を/に/で trong ví dụ ngữ pháp. <a routerLink="/practice">Tất cả bài luyện</a></p>
      </header>
      <app-lesson-selector
        [lessons]="lessons()"
        [value]="lesson()"
        countKind="grammar"
        (valueChange)="onLesson($event)"
      />
      <label class="furigana-toggle">
        <input type="checkbox" [checked]="showFuri()" (change)="showFuri.set($any($event.target).checked)" />
        Hiện furigana
      </label>
      @if (loading()) {
        <p>Đang tải...</p>
      } @else if (!current()) {
        <p>Bài này chưa có ví dụ có trợ từ. Thử bài khác.</p>
      } @else {
        <p class="drill-score">{{ index() + 1 }}/{{ questions().length }} · đúng {{ score().ok }}/{{ score().n || 0 }}</p>
        <div class="drill-card">
          <p class="drill-prompt japanese-text">
            @for (part of current()!.prompt; track $index) {
              @if (part.blank) {
                <span style="color: var(--primary-color)"> {{ part.text }} </span>
              } @else {
                <app-furigana-text [text]="part.text" [show]="showFuri()" />
              }
            }
          </p>
          @if (current()!.vi) {
            <p class="drill-meta">{{ current()!.vi }}</p>
          }
          <div class="drill-options">
            @for (opt of current()!.options; track opt) {
              <button type="button" class="drill-option japanese-text{{ optionClass(opt) }}" [disabled]="picked() != null" (click)="grade(opt)">{{ opt }}</button>
            }
          </div>
        </div>
        <button type="button" class="btn btn-nav" (click)="next()">Câu tiếp</button>
      }
    </div>
  `,
})
export class ParticlesPageComponent {
  private readonly api = inject(ApiService);
  readonly lessons = signal<Lesson[]>([]);
  readonly grammars = signal<Grammar[]>([]);
  readonly loading = signal(true);
  readonly lesson = signal(1);
  readonly index = signal(0);
  readonly picked = signal<string | null>(null);
  readonly score = signal({ ok: 0, n: 0 });
  readonly showFuri = signal(true);

  readonly questions = computed(() => {
    const examples = this.grammars().flatMap((g) =>
      (g.examples ?? []).map((ex) => ({ id: ex.id, jp: ex.jp, vi: ex.vi ?? ex.en })),
    );
    return buildParticleQuestions(examples);
  });
  readonly current = computed(() => this.questions()[this.index()]);

  constructor() {
    void this.api.getLessons({ has: 'grammar' }).then((list) => this.lessons.set(list));
    void this.load(1);
  }

  onLesson(n: number): void {
    this.lesson.set(n);
    this.index.set(0);
    this.picked.set(null);
    void this.load(n);
  }

  grade(opt: string): void {
    const current = this.current();
    if (!current || this.picked()) return;
    this.picked.set(opt);
    this.score.update((s) => ({ ok: s.ok + (opt === current.answer ? 1 : 0), n: s.n + 1 }));
  }

  next(): void {
    this.picked.set(null);
    this.index.update((i) => (i + 1) % Math.max(this.questions().length, 1));
  }

  optionClass(opt: string): string {
    const current = this.current();
    if (this.picked() == null || !current) return '';
    if (opt === current.answer) return ' is-correct';
    if (opt === this.picked()) return ' is-wrong';
    return '';
  }

  private async load(n: number): Promise<void> {
    this.loading.set(true);
    this.grammars.set(await this.api.getGrammars(n));
    this.loading.set(false);
  }
}
