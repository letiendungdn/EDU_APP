"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheTTL = exports.CacheKeys = void 0;
exports.CacheKeys = {
    vocabByLesson: (id) => `vocab:lesson:${id}`,
    grammarByLesson: (id) => `grammar:lesson:${id}`,
    lessonList: () => 'lessons:all',
};
exports.CacheTTL = {
    short: 60,
    medium: 300,
    long: 3600,
    veryLong: 86400,
};
//# sourceMappingURL=cache-keys.js.map