import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskDto {
  question: string;
  history?: ChatMessage[];
  context?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async ask(dto: AskDto): Promise<string> {
    const { question, history = [], context } = dto;

    const systemInstruction = [
      "Bạn là gia sư tiếng Nhật thân thiện và kiên nhẫn.",
      "Giải thích ngắn gọn, dùng ví dụ thực tế từ cuộc sống.",
      "Khi đưa ví dụ: ghi tiếng Nhật, rồi romaji trong ngoặc, rồi nghĩa tiếng Việt.",
      "Trả lời bằng tiếng Việt. Giữ nguyên chữ Nhật khi cần.",
      context ? `Học viên đang học: ${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Gemini dùng "model" | "user" thay vì "assistant" | "user"
    const geminiHistory = history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    try {
      const chat = this.ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction,
          maxOutputTokens: 600,
          temperature: 0.7,
        },
        history: geminiHistory,
      });

      const response = await chat.sendMessage({ message: question });
      return response.text ?? "";
    } catch (error) {
      this.logger.error("Gemini API error", error);
      throw error;
    }
  }
}
