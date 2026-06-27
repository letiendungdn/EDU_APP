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
exports.SrsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const MIN_EASE = 1.3;
let SrsService = class SrsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async reviewCard(userId, cardId, quality) {
        const card = await this.prisma.srsCard.findFirstOrThrow({
            where: { id: cardId, userId },
        });
        let { easeFactor, interval, repetitions } = card;
        if (quality < 3) {
            repetitions = 0;
            interval = 0;
        }
        else {
            if (repetitions === 0) {
                interval = 1;
            }
            else if (repetitions === 1) {
                interval = 6;
            }
            else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
            easeFactor = Math.max(MIN_EASE, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        }
        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + interval);
        const mastered = interval >= 21;
        return this.prisma.srsCard.update({
            where: { id: cardId },
            data: {
                easeFactor,
                interval,
                repetitions,
                nextReviewAt,
                mastered,
                lastReviewedAt: new Date(),
                correctCount: quality >= 3 ? { increment: 1 } : undefined,
                wrongCount: quality < 3 ? { increment: 1 } : undefined,
                reviewStreak: quality >= 3 ? { increment: 1 } : 0,
            },
        });
    }
};
exports.SrsService = SrsService;
exports.SrsService = SrsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SrsService);
//# sourceMappingURL=srs.service.js.map