/** Convert ISO country code → regional indicator flag emoji. */
export function countryFlagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/i.test(code)) return '🌍';
  const upper = code.toUpperCase();
  // UN / EU không phải cờ quốc gia chuẩn — dùng quả địa cầu
  if (upper === 'UN') return '🌍';
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}
