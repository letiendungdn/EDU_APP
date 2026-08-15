export interface StrokeThemeColors {
  guide: string;
  active: string;
  number: string;
  fallback: string;
}

const DEFAULT_DARK: StrokeThemeColors = {
  guide: '#334155',
  active: '#ef4444',
  number: 'rgba(248, 250, 252, 0.55)',
  fallback: '#f8fafc',
};

const DEFAULT_LIGHT: StrokeThemeColors = {
  guide: '#cbd5e1',
  active: '#ef4444',
  number: '#6b7280',
  fallback: '#1c1917',
};

export function getStrokeThemeColors(): StrokeThemeColors {
  if (typeof window === 'undefined') return DEFAULT_LIGHT;

  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  const isLight = document.documentElement.dataset['theme'] === 'light';

  return {
    guide: read('--stroke-guide-color', isLight ? DEFAULT_LIGHT.guide : DEFAULT_DARK.guide),
    active: read('--stroke-active-color', DEFAULT_DARK.active),
    number: read('--stroke-number-color', isLight ? DEFAULT_LIGHT.number : DEFAULT_DARK.number),
    fallback: read('--stroke-fallback-color', isLight ? DEFAULT_LIGHT.fallback : DEFAULT_DARK.fallback),
  };
}

export function strokeWidthForSize(size: number): number {
  // KanjiVG paths live in a 109×109 viewBox, so stroke-width is in those units
  // and already scales with the rendered size. Keep it near the source value (3);
  // size/28 used to make enlarged glyphs look like blobs.
  return size >= 180 ? 2.25 : 2.8;
}
