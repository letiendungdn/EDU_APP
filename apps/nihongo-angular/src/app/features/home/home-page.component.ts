import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type { HomeFeatureSection, HomeStat } from '../../core/models/reference.models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly stats = signal<HomeStat[]>([]);
  readonly sections = signal<HomeFeatureSection[]>([]);

  async ngOnInit() {
    try {
      const data = await this.api.getHomePage();
      this.stats.set(data.stats);
      this.sections.set(data.sections);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
