export const CacheKeys = {
  vocabByLesson: (id: number) => `vocab:lesson:${id}`,
  grammarByLesson: (id: number) => `grammar:lesson:${id}`,
  lessonList: () => 'lessons:all',
} as const;

export const CacheTTL = {
  short: 60,
  medium: 300,
  long: 3600,
  veryLong: 86400,
} as const;
