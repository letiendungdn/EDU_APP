import { NgStyle } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type {
  JlptDaNangSchedulePayload,
  JlptLevelRoadmap,
  JlptRoadmapPayload,
} from '../../core/models/reference.models';

const STORAGE_KEY = 'nihongo-jlpt-progress';

type ProgressRecord = Record<string, boolean>;

type ScheduleAccordionKey = 'venues' | 'examday' | 'fees';

function loadProgress(): ProgressRecord {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as ProgressRecord;
  } catch {
    return {};
  }
}

@Component({
  selector: 'app-jlpt-page',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './jlpt-page.component.html',
  styleUrl: './jlpt-page.component.scss',
})
export class JlptPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly levels = signal<JlptLevelRoadmap[]>([]);
  readonly studyTips = signal<string[]>([]);
  readonly examScheduleNote = signal('');
  readonly staticSchedule = signal<JlptDaNangSchedulePayload | null>(null);
  readonly activeId = signal('n5');
  readonly progress = signal<ProgressRecord>(loadProgress());
  readonly scheduleOpen = signal<Record<ScheduleAccordionKey, boolean>>({
    venues: false,
    examday: false,
    fees: false,
  });

  readonly level = computed(() => {
    const list = this.levels();
    return list.find((l) => l.id === this.activeId()) ?? list[0] ?? null;
  });

  readonly allTaskIds = computed(() =>
    this.level()?.phases.flatMap((p) => p.tasks.map((t) => t.id)) ?? [],
  );

  readonly progressPct = computed(() => {
    const ids = this.allTaskIds();
    if (!ids.length) return 0;
    const done = ids.filter((id) => this.progress()[id]).length;
    return Math.round((done / ids.length) * 100);
  });

  constructor() {
    void Promise.all([this.api.getJlptRoadmap(), this.api.getJlptDaNangScheduleStatic()]).then(
      ([roadmap, schedule]: [JlptRoadmapPayload, JlptDaNangSchedulePayload]) => {
        this.levels.set(roadmap.levels);
        this.studyTips.set(roadmap.studyTips);
        this.examScheduleNote.set(roadmap.examScheduleNote);
        this.staticSchedule.set(schedule);
        this.activeId.set(roadmap.levels[0]?.id ?? 'n5');
        this.loading.set(false);
      },
    );

    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress()));
    });
  }

  setLevel(id: string): void {
    this.activeId.set(id);
  }

  toggleTask(taskId: string): void {
    this.progress.update((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  toggleScheduleSection(key: ScheduleAccordionKey): void {
    this.scheduleOpen.update((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  levelStyle(color: string): Record<string, string> {
    return { '--level-color': color };
  }

  progressRingStyle(color: string, pct: number): Record<string, string> {
    return { '--color': color, '--pct': String(pct) };
  }

  phoneTel(phone: string): string {
    return `tel:${phone.replace(/\s/g, '')}`;
  }
}
