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
exports.UpdateExerciseDto = exports.CreateExerciseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateExerciseDto {
    type;
    question;
    options;
    answer;
    lessonId;
}
exports.CreateExerciseDto = CreateExerciseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['multiple_choice', 'fill_in_blank'] }),
    (0, class_validator_1.IsIn)(['multiple_choice', 'fill_in_blank']),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "answer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "lessonId", void 0);
class UpdateExerciseDto extends (0, swagger_1.PartialType)(CreateExerciseDto) {
}
exports.UpdateExerciseDto = UpdateExerciseDto;
//# sourceMappingURL=exercise.dto.js.map