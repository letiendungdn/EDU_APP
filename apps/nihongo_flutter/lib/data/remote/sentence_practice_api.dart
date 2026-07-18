import 'dart:convert';
import 'package:dio/dio.dart';

class SentenceFeedback {
  const SentenceFeedback({
    required this.corrected,
    required this.reading,
    required this.meaning,
    required this.explanation,
    required this.examples,
  });

  final String corrected;   // empty = câu đúng
  final String reading;
  final String meaning;
  final String explanation;
  final List<String> examples;

  factory SentenceFeedback.fromJson(Map<String, dynamic> j) => SentenceFeedback(
        corrected:   (j['corrected']   as String? ?? '').trim(),
        reading:     (j['reading']     as String? ?? '').trim(),
        meaning:     (j['meaning']     as String? ?? '').trim(),
        explanation: (j['explanation'] as String? ?? '').trim(),
        examples: (j['examples'] as List<dynamic>? ?? [])
            .map((e) => e.toString())
            .toList(),
      );
}

class SentencePracticeApi {
  SentencePracticeApi() : _dio = Dio(BaseOptions(
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
      ));

  final Dio _dio;

  static const _geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // Truyền qua: flutter run --dart-define=GEMINI_API_KEY=xxx
  static const _apiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: '');

  static const _systemPrompt =
      'Bạn là gia sư tiếng Nhật chuyên nghiệp. Người học sẽ viết một câu tiếng Nhật '
      '(hoặc một câu tiếng Việt để nhờ dịch sang tiếng Nhật). '
      'Hãy phản hồi theo cấu trúc JSON sau (KHÔNG thêm markdown, KHÔNG có ```json): '
      '{"corrected":"câu đã sửa (tiếng Nhật, bỏ trống nếu câu đúng)",'
      '"reading":"furigana hoặc romaji cho câu đúng",'
      '"meaning":"nghĩa tiếng Việt",'
      '"explanation":"giải thích ngắn gọn bằng tiếng Việt",'
      '"examples":["câu ví dụ 1 (JP)","câu ví dụ 2 (JP)"]}. '
      'Nếu câu đúng hoàn toàn để "corrected" là "". Giữ giải thích súc tích.';

  Future<SentenceFeedback> analyze(String sentence) async {
    if (_apiKey.isEmpty) {
      throw Exception('GEMINI_API_KEY chưa được cấu hình.\n'
          'Chạy: flutter run --dart-define=GEMINI_API_KEY=your_key');
    }

    final res = await _dio.post<Map<String, dynamic>>(
      '$_geminiUrl?key=$_apiKey',
      data: {
        'system_instruction': {
          'parts': [{'text': _systemPrompt}],
        },
        'contents': [
          {
            'role': 'user',
            'parts': [{'text': sentence}],
          }
        ],
        'generationConfig': {'temperature': 0.3, 'maxOutputTokens': 512},
      },
    );

    final raw = (res.data?['candidates'] as List?)
            ?.firstOrNull?['content']?['parts']
            ?.firstOrNull?['text'] as String? ??
        '';

    // Strip markdown fences nếu model thêm vào
    final fenceMatch = RegExp(
      r'```(?:json)?\s*([\s\S]*?)\s*```',
      multiLine: true,
    ).firstMatch(raw);
    final cleaned = (fenceMatch?.group(1) ?? raw).trim();

    return SentenceFeedback.fromJson(jsonDecode(cleaned) as Map<String, dynamic>);
  }
}
