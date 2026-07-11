export type BannerScope = 'global' | 'page';

export interface BannerStore {
  global: string | null;
  pages: Record<string, string>;
}

export function emptyBannerStore(): BannerStore {
  return { global: null, pages: {} };
}

export function normalizeBannerPath(path: string): string {
  const base = path.split('?')[0].split('#')[0] || '/';
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base;
}

export function resolveBanner(store: BannerStore, path: string): string | null {
  const key = normalizeBannerPath(path);
  return store.pages[key] ?? store.global ?? null;
}

export async function readBannerImageFile(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Không đọc được file ảnh'));
    reader.readAsDataURL(file);
  });

  return resizeBannerDataUrl(dataUrl, 1920, 0.82);
}

function resizeBannerDataUrl(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Ảnh không hợp lệ'));
    img.src = dataUrl;
  });
}

export function bannerBackgroundStyle(
  imageUrl: string,
  theme: 'light' | 'dark',
): Record<string, string> {
  const overlay =
    theme === 'light'
      ? 'linear-gradient(rgba(245,243,239,0.78), rgba(245,243,239,0.9))'
      : 'linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.88))';

  return {
    backgroundImage: `${overlay}, url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };
}
