export const queryKeys = {
  vocab: {
    all: ['vocab'] as const,
    byLesson: (id: number) => ['vocab', 'lesson', id] as const,
    review: () => ['vocab', 'review'] as const,
  },
  grammar: {
    byLesson: (id: number) => ['grammar', 'lesson', id] as const,
  },
  lessons: { all: ['lessons'] as const },
  exam: {
    templates: ['exam', 'templates'] as const,
    byLevel: (lvl: string) => ['exam', lvl] as const,
  },
} as const;
