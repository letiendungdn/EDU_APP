import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Bridge Dart ↔ Kotlin cho các tác vụ nặng trên native (Android).
///
/// Ví dụ use-case:
/// 1. Gộp YUV plane camera trước khi đưa vào ML Kit
/// 2. Downscale JPEG trước OCR
/// 3. Adaptive throttle interval theo thiết bị
class NativePerfChannel {
  NativePerfChannel._();

  static const _channel = MethodChannel('com.edu.nihongo/native_perf');

  static bool get isSupported =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  /// Gộp các plane YUV trên thread native — tránh copy lớn trên Dart isolate UI.
  static Future<Uint8List?> concatenateYuvPlanes(List<Uint8List> planes) async {
    if (!isSupported || planes.isEmpty) return null;

    try {
      final result = await _channel.invokeMethod<Uint8List>(
        'concatenateYuvPlanes',
        {'planes': planes},
      );
      return result;
    } on PlatformException {
      return null;
    }
  }

  /// Giảm kích thước ảnh JPEG trước OCR → ít pixel → ML Kit nhanh hơn.
  static Future<Uint8List?> downscaleJpeg(
    Uint8List bytes, {
    int maxWidth = 960,
  }) async {
    if (!isSupported) return null;

    try {
      return await _channel.invokeMethod<Uint8List>(
        'downscaleJpeg',
        {'bytes': bytes, 'maxWidth': maxWidth},
      );
    } on PlatformException {
      return null;
    }
  }

  /// Gợi ý khoảng cách giữa 2 lần quét OCR (ms) theo CPU/RAM máy.
  static Future<int> suggestedScanIntervalMs() async {
    if (!isSupported) return 900;

    try {
      final ms = await _channel.invokeMethod<int>('getSuggestedScanIntervalMs');
      return ms ?? 900;
    } on PlatformException {
      return 900;
    }
  }

  /// Debug: thông tin thiết bị từ native.
  static Future<Map<String, dynamic>> devicePerfHint() async {
    if (!isSupported) return {};

    try {
      final raw = await _channel.invokeMethod<Map<dynamic, dynamic>>(
        'getDevicePerfHint',
      );
      return raw?.map((k, v) => MapEntry(k.toString(), v)) ?? {};
    } on PlatformException {
      return {};
    }
  }
}
