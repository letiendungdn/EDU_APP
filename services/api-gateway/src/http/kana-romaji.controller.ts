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
  @ApiOperation({ summary: "Chuyển kana/kanji mix sang romaji (kana tra DB)" })
  romaji(@Body() dto: KanaRomajiDto) {
    return {
      text: dto.text,
      romaji: this.kanaRomajiService.toRomaji(dto.text.trim()),
    };
  }
}
