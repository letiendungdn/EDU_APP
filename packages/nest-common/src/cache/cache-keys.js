export const CacheKeys = {
  vocabByLesson: (id) => `vocab:lesson:${id}`,
  grammarByLesson: (id) => `grammar:lesson:${id}`,
  lessonList: (has) => (has ? `lessons:${has}` : 'lessons:all'),
  lessonListAll: () => ['lessons:all', 'lessons:grammar', 'lessons:vocab'],
};
export const CacheTTL = {
  short: 60,
  medium: 300,
  long: 3600,
  veryLong: 86400,
};
