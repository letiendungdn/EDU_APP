import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@app/common";
import { KanaRomajiDto } from "./dto/kana-romaji.dto";
import { KanaRomajiService } from "./kana-romaji.service";

@ApiTags("kana")
@Controller("api/kana")
export class KanaRomajiController {
  constructor(private readonly kanaRomajiService: KanaRomajiService) {}

  @Post("romaji")
  @Public()
  @ApiOperation({ summary: "Đọc kana/kanji — trả hiragana + romaji (tra DB từ vựng/kanji)" })
  async romaji(@Body() dto: KanaRomajiDto) {
    const text = dto.text.trim();
    const reading = await this.kanaRomajiService.resolveReading(text);
    return {
      text,
      kana: reading.kana,
      romaji: reading.romaji,
    };
  }
}
