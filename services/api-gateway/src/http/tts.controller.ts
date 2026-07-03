import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "@app/common";
import { TtsDto } from "./dto/tts.dto";
import { TtsService } from "./tts.service";

@ApiTags("tts")
@Controller("api/tts")
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: "Text-to-speech (Edge TTS) — vi-VN / ja-JP" })
  async synthesize(@Body() dto: TtsDto, @Res() res: Response) {
    try {
      const audio = await this.ttsService.synthesize(dto.text, dto.lang);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.send(audio);
    } catch (err) {
      const message = err instanceof Error ? err.message : "TTS failed";
      throw new BadRequestException(message);
    }
  }
}
