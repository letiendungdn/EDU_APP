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
exports.UpsertDailyGoalsDto = exports.DailyGoalItemDto = exports.UpsertDailyNoteDto = exports.LogListeningDto = exports.SyncReviewDto = exports.ReviewItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ReviewItemDto {
    kana;
    kanji;
    meaning;
    lessonNumber;
    wrongCount;
    reviewStreak;
    mastered;
    lastReviewedAt;
}
exports.ReviewItemDto = ReviewItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "kana", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "kanji", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "meaning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReviewItemDto.prototype, "lessonNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReviewItemDto.prototype, "wrongCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReviewItemDto.prototype, "reviewStreak", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReviewItemDto.prototype, "mastered", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "lastReviewedAt", void 0);
class SyncReviewDto {
    items;
}
exports.SyncReviewDto = SyncReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReviewItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReviewItemDto),
    __metadata("design:type", Array)
], SyncReviewDto.prototype, "items", void 0);
class LogListeningDto {
    date;
    seconds;
}
exports.LogListeningDto = LogListeningDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-24' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LogListeningDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LogListeningDto.prototype, "seconds", void 0);
class UpsertDailyNoteDto {
    date;
    content;
}
exports.UpsertDailyNoteDto = UpsertDailyNoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-26' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertDailyNoteDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertDailyNoteDto.prototype, "content", void 0);
class DailyGoalItemDto {
    id;
    kind;
    label;
    done;
    target;
}
exports.DailyGoalItemDto = DailyGoalItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyGoalItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyGoalItemDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyGoalItemDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DailyGoalItemDto.prototype, "done", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyGoalItemDto.prototype, "target", void 0);
class UpsertDailyGoalsDto {
    date;
    items;
}
exports.UpsertDailyGoalsDto = UpsertDailyGoalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-26' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertDailyGoalsDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DailyGoalItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DailyGoalItemDto),
    __metadata("design:type", Array)
], UpsertDailyGoalsDto.prototype, "items", void 0);
//# sourceMappingURL=progress.dto.js.map