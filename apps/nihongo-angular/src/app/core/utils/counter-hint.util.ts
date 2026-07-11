export function counterHintBullets(hint: string): string[] {
  const trimmed = hint.trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(/\. (?=[GhMÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ])/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return [trimmed];

  return parts.map((part, index) => {
    if (part.endsWith('.') || index < parts.length - 1) return part;
    return `${part}.`;
  });
}
