import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import type { ListeningPlaylistItem } from '../../core/models/api.models';
import type { DailyListeningPayload, ListeningPreset } from '../../core/models/reference.models';

const DEFAULT_GOAL_MINUTES = 15;

@Component({
  selector: 'app-daily-listening-page',
  standalone: true,
  templateUrl: './daily-listening-page.component.html',
  styleUrl: './daily-listening-page.component.scss',
})
export class DailyListeningPageComponent implements OnDestroy {
  private readonly api = inject(ApiService);

  private tickId: ReturnType<typeof setInterval> | null = null;
  private playTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private sessionActive = false;

  readonly configLoading = signal(true);
  readonly playlistLoading = signal(false);
  readonly goalMinutes = signal(DEFAULT_GOAL_MINUTES);
  readonly presets = signal<ListeningPreset[]>([]);
  readonly presetId = signal('');
  readonly showMeaning = signal(true);
  readonly shadowing = signal(false);
  readonly revealed = signal(true);
  readonly playlist = signal<ListeningPlaylistItem[]>([]);
  readonly currentIndex = signal(0);
  readonly isRunning = signal(false);
  readonly isPaused = signal(false);
  readonly elapsed = signal(0);

  readonly resolvedPreset = computed(() => {
    const list = this.presets();
    const id = this.presetId();
    return list.find((p) => p.id === id) ?? list[2] ?? list[0] ?? null;
  });

  readonly current = computed(() => {
    const list = this.playlist();
    const idx = this.currentIndex();
    return list[idx] ?? null;
  });

  readonly progressPct = computed(() => {
    const goal = this.goalMinutes() * 60;
    return goal ? Math.min(100, Math.round((this.elapsed() / goal) * 100)) : 0;
  });

  readonly goalReached = computed(() => this.elapsed() >= this.goalMinutes() * 60);

  constructor() {
    void this.api.getDailyListeningConfig().then((cfg: DailyListeningPayload) => {
      this.goalMinutes.set(cfg.goalMinutes ?? DEFAULT_GOAL_MINUTES);
      this.presets.set(cfg.presets ?? []);
      const defaultPreset = cfg.presets?.[2] ?? cfg.presets?.[0];
      if (defaultPreset) this.presetId.set(defaultPreset.id);
      this.configLoading.set(false);
    });

    effect(() => {
      const preset = this.resolvedPreset();
      if (!preset) return;
      this.playlistLoading.set(true);
      void this.api
        .getListeningPlaylist(preset.lessonFrom, preset.lessonTo)
        .then((data) => {
          this.playlist.set(data.items ?? []);
          this.currentIndex.set(0);
          this.playlistLoading.set(false);
        });
    });
  }

  ngOnDestroy(): void {
    this.stopSession();
  }

  onPresetChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.presetId.set(value);
    this.stopSession();
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  startSession(): void {
    const list = this.playlist();
    if (!list.length) return;
    this.sessionActive = true;
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.currentIndex.set(0);
    this.startTick();
    this.playFromIndex(0);
  }

  pauseSession(): void {
    this.sessionActive = false;
    this.isRunning.set(false);
    this.isPaused.set(true);
    this.clearPlayTimeout();
    this.stopTick();
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }

  resumeSession(): void {
    if (!this.playlist().length) return;
    this.sessionActive = true;
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.startTick();
    this.playFromIndex(this.currentIndex());
  }

  stopSession(): void {
    this.sessionActive = false;
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.clearPlayTimeout();
    this.stopTick();
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }

  replayCurrent(): void {
    const item = this.current();
    if (item) playJapanese(item.speakText);
  }

  private startTick(): void {
    this.stopTick();
    this.tickId = setInterval(() => {
      this.elapsed.update((v) => v + 1);
      if (this.goalReached()) this.pauseSession();
    }, 1000);
  }

  private stopTick(): void {
    if (this.tickId) {
      clearInterval(this.tickId);
      this.tickId = null;
    }
  }

  private clearPlayTimeout(): void {
    if (this.playTimeoutId) {
      clearTimeout(this.playTimeoutId);
      this.playTimeoutId = null;
    }
  }

  private playFromIndex(start: number): void {
    const list = this.playlist();
    if (!this.sessionActive || !list.length) return;

    const playNext = (index: number) => {
      if (!this.sessionActive || index >= list.length) {
        if (this.sessionActive) this.playFromIndex(0);
        return;
      }
      this.currentIndex.set(index);
      playJapanese(list[index].speakText);
      this.revealed.set(!this.shadowing());
      this.playTimeoutId = setTimeout(() => playNext(index + 1), 2500);
    };

    playNext(start);
  }
}
