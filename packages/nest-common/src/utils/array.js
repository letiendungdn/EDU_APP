"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = shuffle;
exports.sample = sample;
function shuffle(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function sample(items, count) {
    return shuffle(items).slice(0, Math.min(count, items.length));
}
//# sourceMappingURL=array.js.map