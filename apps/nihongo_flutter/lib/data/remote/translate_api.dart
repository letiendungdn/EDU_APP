import 'package:dio/dio.dart';

class TranslateApi {
  TranslateApi(this._dio);
  final Dio _dio;

  final _cache = <String, String>{};

  Future<String> translateJapanese(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return '';

    if (_cache.containsKey(trimmed)) return _cache[trimmed]!;

    final res = await _dio.post<Map<String, dynamic>>(
      '/translate',
      data: {
        'text': trimmed,
        'sourceLang': 'ja',
        'targetLang': 'vi',
      },
    );

    final translated = res.data?['translation'] as String? ?? trimmed;
    _cache[trimmed] = translated;
    return translated;
  }
}
