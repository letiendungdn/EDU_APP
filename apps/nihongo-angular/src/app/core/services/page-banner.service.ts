import { computed, inject, Injectable, signal } from '@angular/core';
import {
  bannerBackgroundStyle,
  emptyBannerStore,
  normalizeBannerPath,
  resolveBanner,
  type BannerScope,
  type BannerStore,
} from '../utils/page-banner.util';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class PageBannerService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  private readonly store = signal<BannerStore>(emptyBannerStore());
  private loaded = false;

  readonly currentPath = signal('/');

  readonly bannerUrl = computed(() => resolveBanner(this.store(), this.currentPath()));

  readonly contentStyle = computed(() => {
    const url = this.bannerUrl();
    if (!url) return null;
    return bannerBackgroundStyle(url, this.theme.theme());
  });

  setPath(path: string): void {
    this.currentPath.set(normalizeBannerPath(path));
    if (!this.loaded) {
      this.loaded = true;
      void this.reload();
    }
  }

  async reload(): Promise<void> {
    try {
      this.store.set(await this.api.getBannerConfig());
    } catch {
      /* banner là trang trí — lỗi mạng không chặn app */
    }
  }

  async apply(imageDataUrl: string, scope: BannerScope): Promise<void> {
    const token = this.requireToken();
    const next = await this.api.upsertBanner(
      token,
      scope,
      scope === 'page' ? this.currentPath() : undefined,
      imageDataUrl,
    );
    this.store.set(next);
  }

  async remove(scope: 'global' | 'page' | 'all'): Promise<void> {
    const token = this.requireToken();
    const next = await this.api.deleteBanner(token, scope, this.currentPath());
    this.store.set(next);
  }

  private requireToken(): string {
    const token = this.auth.token();
    if (!token) throw new Error('Chưa đăng nhập');
    return token;
  }
}
