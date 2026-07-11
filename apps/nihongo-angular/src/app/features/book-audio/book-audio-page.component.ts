import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import type { BookAudioItem, BookAudioPayload } from '../../core/models/reference.models';

@Component({
  selector: 'app-book-audio-page',
  standalone: true,
  templateUrl: './book-audio-page.component.html',
  styleUrl: './book-audio-page.component.scss',
})
export class BookAudioPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<BookAudioPayload | null>(null);
  readonly activeLevel = signal('');
  readonly expandedIds = signal<Set<string>>(new Set());

  readonly sections = computed(() => this.data()?.sections ?? []);

  readonly section = computed(() => {
    const list = this.sections();
    const level = this.activeLevel() || list[0]?.level || '';
    return list.find((s) => s.level === level) ?? list[0] ?? null;
  });

  readonly totalLocal = computed(() =>
    this.sections().reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + (i.localFiles?.length ?? 0), 0),
      0,
    ),
  );

  constructor() {
    void this.api
      .getBookAudioFiles()
      .then((payload) => {
        this.data.set(payload);
        this.activeLevel.set(payload.sections[0]?.level ?? '');
        this.loading.set(false);
      })
      .catch(() => {
        this.error.set(true);
        this.loading.set(false);
      });
  }

  setLevel(level: string): void {
    this.activeLevel.set(level);
  }

  toggleExpanded(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  linkLabel(url: string): string {
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('slideshare.net')) return 'SlideShare';
    if (url.includes('bit.ly')) return 'Link rút gọn';
    return 'Mở link';
  }

  isPlayable(path: string): boolean {
    return /\.(mp3|wma|wav|m4a|ogg|flac|aac)$/i.test(path);
  }

  localFileCount(item: BookAudioItem): number {
    return item.localFiles?.length ?? 0;
  }
}
