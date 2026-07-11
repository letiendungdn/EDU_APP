import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { DailyGoalItemRow, DailyNoteRow } from '../../core/models/api.models';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notes-page.component.html',
  styleUrl: './notes-page.component.scss',
})
export class NotesPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveMessage = signal('');
  readonly selectedDate = signal(todayKey());
  readonly notes = signal<DailyNoteRow[]>([]);
  readonly goals = signal<DailyGoalItemRow[]>([]);

  content = '';
  customGoal = '';

  readonly prompts = [
    'Hôm nay học được gì?',
    'Từ mới: ',
    'Ngữ pháp khó: ',
    'Cần ôn lại: ',
  ];

  readonly today = todayKey();

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      return;
    }

    try {
      const [noteRows, goalRows] = await Promise.all([
        this.api.getDailyNotes(token),
        this.api.getDailyGoals(token),
      ]);
      this.notes.set(noteRows);
      this.syncEditorForDate(this.selectedDate());
      const todayGoals = goalRows.find((g) => g.date === this.selectedDate());
      this.goals.set(todayGoals?.items ?? []);
    } catch {
      /* local-only mode */
    } finally {
      this.loading.set(false);
    }
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.syncEditorForDate(date);
    const token = this.auth.token();
    if (!token) return;
    void this.api.getDailyGoals(token).then((rows) => {
      const row = rows.find((g) => g.date === date);
      this.goals.set(row?.items ?? []);
    });
  }

  private syncEditorForDate(date: string): void {
    const row = this.notes().find((n) => n.date === date);
    this.content = row?.content ?? '';
  }

  appendPrompt(prompt: string): void {
    const prefix = this.content.trim() ? `${this.content.trimEnd()}\n\n` : '';
    this.content = `${prefix}${prompt}`;
    void this.saveNote();
  }

  async saveNote(): Promise<void> {
    const token = this.auth.token();
    const date = this.selectedDate();
    this.saving.set(true);
    this.saveMessage.set('');

    if (!token) {
      this.saving.set(false);
      this.saveMessage.set('Lưu cục bộ — đăng nhập để đồng bộ');
      return;
    }

    try {
      const row = await this.api.upsertDailyNote(token, date, this.content);
      this.notes.update((list) => {
        const idx = list.findIndex((n) => n.date === date);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = row;
          return next;
        }
        return [...list, row];
      });
      this.saveMessage.set('Đã lưu');
    } catch (err) {
      this.saveMessage.set(err instanceof ApiError ? err.message : 'Lỗi lưu ghi chú');
    } finally {
      this.saving.set(false);
    }
  }

  toggleGoal(goalId: string): void {
    const token = this.auth.token();
    const date = this.selectedDate();
    const next = this.goals().map((g) => (g.id === goalId ? { ...g, done: !g.done } : g));
    this.goals.set(next);
    if (!token) return;
    void this.api.upsertDailyGoals(token, date, next);
  }

  addCustomGoal(): void {
    const label = this.customGoal.trim();
    if (!label) return;
    const token = this.auth.token();
    const date = this.selectedDate();
    const next: DailyGoalItemRow[] = [
      ...this.goals(),
      { id: `custom-${Date.now()}`, kind: 'custom', label, done: false },
    ];
    this.goals.set(next);
    this.customGoal = '';
    if (!token) return;
    void this.api.upsertDailyGoals(token, date, next);
  }

  doneCount(): number {
    return this.goals().filter((g) => g.done).length;
  }

  goalPct(): number {
    const total = this.goals().length;
    if (!total) return 0;
    return Math.round((this.doneCount() / total) * 100);
  }

  noteDates(): string[] {
    const dates = new Set(this.notes().filter((n) => n.content.trim()).map((n) => n.date));
    dates.add(this.selectedDate());
    return [...dates].sort((a, b) => b.localeCompare(a));
  }
}
