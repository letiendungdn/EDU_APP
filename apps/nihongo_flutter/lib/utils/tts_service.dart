import 'dart:io';
import 'package:flutter_tts/flutter_tts.dart';

class TtsService {
  TtsService._();
  static final TtsService instance = TtsService._();

  final FlutterTts _tts = FlutterTts();
  bool _ready = false;

  Future<void> _ensureReady() async {
    if (_ready) return;
    await _tts.setLanguage('ja-JP');
    await _tts.setSpeechRate(0.7);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
    // Android: chọn engine TTS tốt nhất có sẵn
    if (Platform.isAndroid) {
      await _tts.setQueueMode(1); // flush queue before speak
    }
    _ready = true;
  }

  Future<void> speak(String text) async {
    if (text.trim().isEmpty) return;
    await _ensureReady();
    await _tts.stop();
    await _tts.speak(text.trim());
  }

  Future<void> stop() => _tts.stop();

  void dispose() => _tts.stop();
}
