import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TranslateApi {
  TranslateApi(this._dio);
  final Dio _dio;

  // In-memory cache for this session
  final Map<String, String> _cache = {};

  // Persist translations across sessions via SharedPreferences
  static const _prefKey = 'translation_cache_v1';
  bool _persistLoaded = false;

  Future<void> _loadPersistentCache() async {
    if (_persistLoaded) return;
    _persistLoaded = true;
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefKey);
    if (raw != null) {
      final Map<String, dynamic> decoded = jsonDecode(raw);
      decoded.forEach((k, v) => _cache[k] = v as String);
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    // Keep only latest 500 entries to avoid bloat
    final trimmed = _cache.entries.toList();
    if (trimmed.length > 500) {
      trimmed.removeRange(0, trimmed.length - 500);
    }
    final map = {for (final e in trimmed) e.key: e.value};
    await prefs.setString(_prefKey, jsonEncode(map));
  }

  Future<String> translateJapanese(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return '';

    await _loadPersistentCache();

    if (_cache.containsKey(trimmed)) return _cache[trimmed]!;

    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/translate',
        data: {'text': trimmed, 'sourceLang': 'ja', 'targetLang': 'vi'},
      );
      final translated = res.data?['translation'] as String? ?? trimmed;
      _cache[trimmed] = translated;
      // Fire-and-forget persist — không block UI
      _persist();
      return translated;
    } on DioException {
      // Mất mạng → trả cached nếu có, không thì trả nguyên bản
      return _cache[trimmed] ?? trimmed;
    }
  }
}
