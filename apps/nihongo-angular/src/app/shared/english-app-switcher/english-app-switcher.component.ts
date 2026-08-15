import { Component, OnInit, signal } from '@angular/core';

interface AppFeaturesResponse {
  english: { enabled: boolean; url: string };
}

@Component({
  selector: 'app-english-app-switcher',
  standalone: true,
  template: `
    @if (englishUrl()) {
      <a [href]="englishUrl()!" class="nav-link app-switcher" title="English">🇬🇧 <span class="app-switcher__label">English</span></a>
    }
  `,
})
export class EnglishAppSwitcherComponent implements OnInit {
  readonly englishUrl = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const res = await fetch('/app-features', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as AppFeaturesResponse;
      if (data.english?.enabled && data.english.url) {
        this.englishUrl.set(data.english.url);
      }
    } catch {
      /* optional feature */
    }
  }
}
