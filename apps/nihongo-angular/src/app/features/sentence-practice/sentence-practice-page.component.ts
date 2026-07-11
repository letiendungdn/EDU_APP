import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import type { SentencePracticeFeedback } from '../../core/models/api.models';

interface HistoryEntry {
  id: number;
  sentence: string;
  feedback: SentencePracticeFeedback;
  timestamp: Date;
  open?: boolean;
}

const STARTERS = [
  'わたしは まいにち にほんご を べんきょう します。',
  'きのう ともだち と えいが を みました。',
  'すみません、えき は どこ ですか？',
  'わたし の しゅみ は おんがく を きく こと です。',
  'Dịch: Hôm nay trời đẹp nhỉ.',
  'Dịch: Tôi muốn đến Nhật Bản năm sau.',
];

@Component({
  selector: 'app-sentence-practice-page',
  standalone: true,
  templateUrl: './sentence-practice-page.component.html',
  styleUrl: './sentence-practice-page.component.scss',
})
export class SentencePracticePageComponent {
  private readonly api = inject(ApiService);

  readonly starters = STARTERS;

  readonly sentence = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly history = signal<HistoryEntry[]>([]);
  private idCounter = 0;

  @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;

  newest(): HistoryEntry | undefined {
    return this.history()[0];
  }

  onSentenceInput(value: string): void {
    this.sentence.set(value);
    this.resizeTextarea();
  }

  useStarter(s: string): void {
    this.sentence.set(s);
    this.resizeTextarea();
    this.textareaRef?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void this.submit();
    }
  }

  async submit(): Promise<void> {
    const trimmed = this.sentence().trim();
    if (!trimmed || this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const feedback = await this.api.analyzeSentence(trimmed);
      const entry: HistoryEntry = {
        id: this.idCounter++,
        sentence: trimmed,
        feedback,
        timestamp: new Date(),
      };
      this.history.update((prev) => [entry, ...prev]);
      this.sentence.set('');
      this.resizeTextarea();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }

    this.loading.set(false);
  }

  isOpen(entry: HistoryEntry, expandedDefault = false): boolean {
    return entry.open ?? expandedDefault;
  }

  hasCorrection(entry: HistoryEntry): boolean {
    return !!entry.feedback.corrected && entry.feedback.corrected !== entry.sentence;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  setEntryOpen(entryId: number, open: boolean): void {
    this.history.update((items) =>
      items.map((item) => (item.id === entryId ? { ...item, open } : item)),
    );
  }

  private resizeTextarea(): void {
    queueMicrotask(() => {
      const el = this.textareaRef?.nativeElement;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });
  }
}
