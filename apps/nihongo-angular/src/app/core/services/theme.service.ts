import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'nihongo-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('dark');

  init(): void {
    if (typeof document === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const sys =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    const initial = saved ?? sys;
    this.apply(initial);
  }

  toggle(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
