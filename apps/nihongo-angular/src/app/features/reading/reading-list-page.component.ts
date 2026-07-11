import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { JLPT_LEVELS, type JlptLevel, type ReadingPassageSummary } from '../../core/models/api.models';

@Component({
  selector: 'app-reading-list-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reading-list-page.component.html',
  styleUrl: './reading-list-page.component.scss',
})
export class ReadingListPageComponent {
  private readonly api = inject(ApiService);

  readonly levels = JLPT_LEVELS;
  readonly filterLevel = signal<JlptLevel | ''>('');
  readonly passages = signal<ReadingPassageSummary[]>([]);
  readonly loading = signal(true);

  readonly grouped = computed(() => {
    const map = new Map<string, ReadingPassageSummary[]>();
    for (const p of this.passages()) {
      const lvl = p.jlptLevel ?? 'Khác';
      const list = map.get(lvl) ?? [];
      list.push(p);
      map.set(lvl, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  });

  constructor() {
    void this.load();
  }

  setFilter(level: JlptLevel | ''): void {
    this.filterLevel.set(level);
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const level = this.filterLevel();
    const data = await this.api.getReadingPassages(level || undefined);
    this.passages.set(data);
    this.loading.set(false);
  }
}
