import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AiService, ChatMessage } from "./ai.service";

class ChatMessageDto implements ChatMessage {
  @IsString() role: "user" | "assistant";
  @IsString() content: string;
}

class AskRequestDto {
  @IsString() question: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @IsOptional()
  @IsString()
  context?: string;
}

@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("chat")
  @HttpCode(200)
  async chat(@Body() dto: AskRequestDto): Promise<{ answer: string }> {
    const answer = await this.ai.ask(dto);
    return { answer };
  }
}
