import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type { MockExamTemplate } from '../../core/models/api.models';

@Component({
  selector: 'app-mock-exam-list-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mock-exam-list-page.component.html',
  styleUrl: './mock-exam-list-page.component.scss',
})
export class MockExamListPageComponent {
  private readonly api = inject(ApiService);

  readonly templates = signal<MockExamTemplate[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    void this.api
      .getMockExamTemplates()
      .then((data) => {
        this.templates.set(data);
        this.loading.set(false);
      })
      .catch(() => {
        this.error.set(true);
        this.loading.set(false);
      });
  }
}
