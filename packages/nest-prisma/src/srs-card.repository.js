"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SrsCardRepository = exports.VOCABULARY_CONTENT_TYPE = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
exports.VOCABULARY_CONTENT_TYPE = 'VOCABULARY';
let SrsCardRepository = class SrsCardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertVocabularyReviewCard(userId, contentId, item, lastReviewedAt) {
        await this.prisma.srsCard.upsert({
            where: {
                userId_contentType_contentId: {
                    userId,
                    contentType: exports.VOCABULARY_CONTENT_TYPE,
                    contentId,
                },
            },
            create: {
                userId,
                contentType: exports.VOCABULARY_CONTENT_TYPE,
                contentId,
                wrongCount: item.wrongCount,
                reviewStreak: item.reviewStreak,
                mastered: item.mastered,
                lastReviewedAt,
            },
            update: {
                wrongCount: item.wrongCount,
                reviewStreak: item.reviewStreak,
                mastered: item.mastered,
                lastReviewedAt,
            },
        });
    }
    async findVocabularyReviewBank(userId) {
        const cards = await this.prisma.srsCard.findMany({
            where: { userId, contentType: exports.VOCABULARY_CONTENT_TYPE },
            orderBy: [{ mastered: 'asc' }, { wrongCount: 'desc' }],
        });
        if (!cards.length)
            return [];
        const vocabIds = cards.map((c) => c.contentId);
        const vocabularies = await this.prisma.vocabulary.findMany({
            where: { id: { in: vocabIds } },
            include: { lesson: { select: { lessonNumber: true } } },
        });
        const vocabById = new Map(vocabularies.map((v) => [v.id, v]));
        return cards
            .map((card) => {
            const vocab = vocabById.get(card.contentId);
            if (!vocab)
                return null;
            return {
                kana: vocab.kana,
                kanji: vocab.kanji,
                meaning: vocab.meaning,
                lessonNumber: vocab.lesson.lessonNumber,
                wrongCount: card.wrongCount,
                reviewStreak: card.reviewStreak,
                mastered: card.mastered,
                lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
            };
        })
            .filter((item) => item !== null);
    }
};
exports.SrsCardRepository = SrsCardRepository;
exports.SrsCardRepository = SrsCardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SrsCardRepository);
//# sourceMappingURL=srs-card.repository.js.map