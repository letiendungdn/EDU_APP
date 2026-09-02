export declare const CacheKeys: {
    readonly vocabByLesson: (id: number) => string;
    readonly grammarByLesson: (id: number) => string;
    readonly lessonList: (has?: "grammar" | "vocab") => string;
    readonly lessonListAll: () => readonly ["lessons:all", "lessons:grammar", "lessons:vocab"];
};
export declare const CacheTTL: {
    readonly short: 60;
    readonly medium: 300;
    readonly long: 3600;
    readonly veryLong: 86400;
};
