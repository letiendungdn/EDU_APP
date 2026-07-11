import { Component, Input, output } from '@angular/core';
import type { Lesson } from '../../core/models/api.models';

@Component({
  selector: 'app-lesson-selector',
  standalone: true,
  templateUrl: './lesson-selector.component.html',
  styleUrl: './lesson-selector.component.scss',
})
export class LessonSelectorComponent {
  @Input({ required: true }) lessons: Lesson[] = [];
  @Input({ required: true }) value = 1;
  readonly valueChange = output<number>();

  onSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(Number(target.value));
  }
}
