import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import type {
  JapaneseVocabSuffixesPayload,
  VocabSuffixGroup,
  VocabSuffixItem,
} from '../../core/models/reference.models';

@Component({
  selector: 'app-suffixes-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './suffixes-page.component.html',
  styleUrl: './suffixes-page.component.scss',
})
export class SuffixesPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly groups = signal<VocabSuffixGroup[]>([]);
  readonly activeId = signal('');
  readonly searchQuery = signal('');
  readonly playingAll = signal(false);
  readonly selectedKey = signal<string | null>(null);

  readonly category = computed(() => {
    const groups = this.groups();
    const id = this.activeId() || groups[0]?.id || '';
    return groups.find((g) => g.id === id) ?? groups[0] ?? null;
  });

  readonly items = computed(() => {
    const source = this.category()?.items ?? [];
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return source;
    return source.filter((item) => this.matches(item, q));
  });

  constructor() {
    void this.api.getJapaneseVocabSuffixes().then((data: JapaneseVocabSuffixesPayload) => {
      this.groups.set(data.groups);
      this.activeId.set(data.groups[0]?.id ?? '');
      this.loading.set(false);
    });
  }

  setCategory(id: string): void {
    this.playingAll.set(false);
    this.selectedKey.set(null);
    this.activeId.set(id);
  }

  itemKey(categoryId: string, item: VocabSuffixItem): string {
    return `${categoryId}-${item.suffix}-${item.kana}`;
  }

  selectAndSpeak(key: string, text: string): void {
    this.selectedKey.set(key);
    playJapanese(text);
  }

  speak(kana: string): void {
    playJapanese(kana);
  }

  speakExample(event: Event, exampleJa?: string): void {
    event.stopPropagation();
    if (exampleJa) playJapanese(exampleJa);
  }

  private matches(item: VocabSuffixItem, query: string): boolean {
    return [
      item.suffix,
      item.kana,
      item.romaji,
      item.meaning,
      item.attachesTo,
      item.exampleJa,
      item.exampleVi,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }
}
