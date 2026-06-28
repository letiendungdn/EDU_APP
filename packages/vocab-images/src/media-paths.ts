export const OPENMOJI_VERSION = '15.0.0';

export const MEDIA = {
  openmoji: '/media/openmoji',
  kanjivg: '/media/kanjivg',
  kanji: '/media/kanji',
} as const;

export function openmojiCdnUrl(code: string): string {
  return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@${OPENMOJI_VERSION}/color/svg/${code.toUpperCase()}.svg`;
}

export function openmojiLocalPath(code: string): string {
  return `${MEDIA.openmoji}/${code.toUpperCase()}.svg`;
}

export function kanjivgHex(char: string): string {
  return char.codePointAt(0)?.toString(16).padStart(5, '0') ?? '00000';
}

export function kanjivgHexVariants(char: string): string[] {
  const cp = char.codePointAt(0);
  if (cp == null) return ['00000'];
  const base = cp.toString(16).toLowerCase();
  const five = base.padStart(5, '0');
  return [...new Set([five, base, base.padStart(4, '0')])];
}

export function kanjivgCdnUrl(hex: string): string {
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex.toLowerCase()}.svg`;
}

export function kanjivgLocalPath(hex: string): string {
  return `${MEDIA.kanjivg}/${hex.toLowerCase()}.svg`;
}

export function kanjiStrokeSvgUrl(char: string): string {
  return kanjivgLocalPath(kanjivgHex(char));
}

/** vnjpclub.com/... → /media/kanji/... */
export function kanjiMnemonicLocalPath(url: string): string | null {
  const m = url.match(/vnjpclub\.com\/images\/(.+?)(?:\?.*)?$/i);
  if (!m) return null;
  return `${MEDIA.kanji}/${m[1]}`;
}

export function toLocalImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const openmojiLocal = url.match(/^\/media\/openmoji\/([A-F0-9-]+)(?:\.svg)?$/i);
  if (openmojiLocal) return openmojiLocalPath(openmojiLocal[1]!);

  const kanjivgLocal = url.match(/^\/media\/kanjivg\/([0-9a-f]+)(?:\.svg)?$/i);
  if (kanjivgLocal) return kanjivgLocalPath(kanjivgLocal[1]!);

  if (url.startsWith('/media/')) return url;

  const openmoji = url.match(/openmoji@[\d.]+\/color\/svg\/([A-F0-9-]+)\.svg/i);
  if (openmoji) return openmojiLocalPath(openmoji[1]!);

  const kanjivg = url.match(/kanjivg\/master\/kanji\/([0-9a-f]+)\.svg/i);
  if (kanjivg) return kanjivgLocalPath(kanjivg[1]!);

  const kanjiMnemonic = kanjiMnemonicLocalPath(url);
  if (kanjiMnemonic) return kanjiMnemonic;

  if (url.includes('upload.wikimedia.org')) return null;

  if (/^https?:\/\//i.test(url)) return null;

  return url;
}
