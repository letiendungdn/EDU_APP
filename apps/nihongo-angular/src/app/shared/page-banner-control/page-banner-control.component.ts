import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PageBannerService } from '../../core/services/page-banner.service';
import { readBannerImageFile, type BannerScope } from '../../core/utils/page-banner.util';

@Component({
  selector: 'app-page-banner-control',
  standalone: true,
  templateUrl: './page-banner-control.component.html',
  styleUrl: './page-banner-control.component.scss',
})
export class PageBannerControlComponent {
  readonly banners = inject(PageBannerService);
  readonly auth = inject(AuthService);

  readonly open = signal(false);
  readonly scope = signal<BannerScope>('page');
  readonly preview = signal<string | null>(null);
  readonly error = signal('');
  readonly busy = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Vui lòng chọn file ảnh (JPG, PNG, WebP…).');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      this.preview.set(await readBannerImageFile(file));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không xử lý được ảnh.');
    } finally {
      this.busy.set(false);
    }
  }

  setScope(scope: BannerScope): void {
    this.scope.set(scope);
  }

  async apply(): Promise<void> {
    const image = this.preview();
    if (!image) {
      this.error.set('Hãy chọn ảnh trước khi áp dụng.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.banners.apply(image, this.scope());
      this.preview.set(null);
      this.close();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không lưu được banner.');
    } finally {
      this.busy.set(false);
    }
  }

  async clearCurrent(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.banners.remove(this.scope() === 'global' ? 'global' : 'page');
      this.preview.set(null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không xóa được banner.');
    } finally {
      this.busy.set(false);
    }
  }

  async clearAll(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.banners.remove('all');
      this.preview.set(null);
      this.close();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Không xóa được banner.');
    } finally {
      this.busy.set(false);
    }
  }
}
