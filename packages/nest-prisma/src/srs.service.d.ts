import { PrismaService } from './prisma.service';
export declare class SrsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    reviewCard(userId: number, cardId: number, quality: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        contentType: import("@prisma/client").$Enums.ContentType;
        contentId: number;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReviewAt: Date | null;
        lastReviewedAt: Date | null;
        correctCount: number;
        wrongCount: number;
        reviewStreak: number;
        mastered: boolean;
    }>;
}
