export function normalizeAnswer(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '');
}

export function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}
