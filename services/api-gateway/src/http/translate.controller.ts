import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@app/common";
import { TranslateDto } from "./dto/translate.dto";
import { TranslateService } from "./translate.service";

@ApiTags("translate")
@Controller("api/translate")
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: "Dịch văn bản (camera OCR overlay)" })
  async translate(@Body() dto: TranslateDto) {
    const translation = await this.translateService.translate(
      dto.text,
      dto.sourceLang ?? "ja",
      dto.targetLang ?? "vi",
    );

    return {
      text: dto.text,
      translation,
      sourceLang: dto.sourceLang ?? "ja",
      targetLang: dto.targetLang ?? "vi",
    };
  }
}
