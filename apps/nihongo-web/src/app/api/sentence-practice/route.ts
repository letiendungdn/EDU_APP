import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Bạn là gia sư tiếng Nhật chuyên nghiệp. Người học sẽ viết một câu tiếng Nhật (hoặc một câu tiếng Việt để nhờ dịch sang tiếng Nhật).

Hãy phản hồi theo cấu trúc JSON sau (KHÔNG thêm markdown, KHÔNG có \`\`\`json):
{
  "corrected": "câu đã sửa (tiếng Nhật, bỏ trống nếu câu đúng)",
  "reading": "furigana hoặc romaji cho câu đúng",
  "meaning": "nghĩa tiếng Việt",
  "explanation": "giải thích ngắn gọn bằng tiếng Việt — chỉ ra lỗi sai (nếu có), cấu trúc ngữ pháp được dùng, và ghi chú quan trọng",
  "examples": ["câu ví dụ tương tự 1 (JP)", "câu ví dụ tương tự 2 (JP)"]
}

Nếu câu đúng hoàn toàn, để "corrected" là "". Giữ giải thích súc tích, rõ ràng.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  let body: { sentence?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sentence = (body.sentence ?? '').trim();
  if (!sentence) {
    return NextResponse.json({ error: 'sentence is required' }, { status: 400 });
  }

  const geminiBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: sentence }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown fences if Gemini wraps them anyway
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response', raw }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
