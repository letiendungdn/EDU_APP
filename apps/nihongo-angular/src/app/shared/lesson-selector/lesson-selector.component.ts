import { Component, Input, output } from '@angular/core';
import type { Lesson } from '../../core/models/api.models';

export type LessonCountKind = 'vocab' | 'grammar' | 'none';

@Component({
  selector: 'app-lesson-selector',
  standalone: true,
  templateUrl: './lesson-selector.component.html',
  styleUrl: './lesson-selector.component.scss',
})
export class LessonSelectorComponent {
  @Input({ required: true }) lessons: Lesson[] = [];
  @Input({ required: true }) value = 1;
  @Input() filterWithContent = true;
  @Input() countKind: LessonCountKind = 'vocab';
  readonly valueChange = output<number>();

  get visibleLessons(): Lesson[] {
    if (!this.filterWithContent) return this.lessons;
    return this.lessons.filter((lesson) => this.hasContent(lesson));
  }

  onSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(Number(target.value));
  }

  countSuffix(lesson: Lesson): string {
    if (this.countKind === 'none') return '';

    const count =
      this.countKind === 'grammar'
        ? lesson._count?.grammars
        : lesson._count?.vocabularies;

    if (count == null) return '';

    return this.countKind === 'grammar' ? ` (${count} mục)` : ` (${count} từ)`;
  }

  labelFor(lesson: Lesson): string {
    return lesson.title ?? `Bài ${lesson.lessonNumber}`;
  }

  private hasContent(lesson: Lesson): boolean {
    if (this.countKind === 'grammar') {
      return (lesson._count?.grammars ?? 0) > 0;
    }
    if (this.countKind === 'vocab') {
      return (lesson._count?.vocabularies ?? 0) > 0;
    }
    return (
      (lesson._count?.vocabularies ?? 0) > 0 ||
      (lesson._count?.grammars ?? 0) > 0 ||
      (lesson._count?.exercises ?? 0) > 0
    );
  }
}
