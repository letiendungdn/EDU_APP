"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAnswer = normalizeAnswer;
exports.parseJsonArray = parseJsonArray;
function normalizeAnswer(text) {
    return text.trim().toLowerCase().replace(/\s+/g, '');
}
function parseJsonArray(raw) {
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=string.js.map