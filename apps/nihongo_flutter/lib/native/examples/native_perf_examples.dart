import 'package:flutter/foundation.dart';

import '../native_perf_channel.dart';

/// Các ví dụ minh họa khi nào nên gọi native thay vì pure Dart.
///
/// Chạy thử trong debug console hoặc gọi từ màn dev/settings.
class NativePerfExamples {
  /// Ví dụ 1: So sánh gộp buffer — native thường nhanh hơn với frame camera lớn.
  static Future<void> demoYuvConcat(List<Uint8List> planes) async {
    final sw = Stopwatch()..start();
    final native = await NativePerfChannel.concatenateYuvPlanes(planes);
    sw.stop();
    debugPrint('[Native] concatenateYuvPlanes: ${sw.elapsedMilliseconds}ms '
        '→ ${native?.length ?? 0} bytes');

    sw
      ..reset()
      ..start();
    final dart = _concatenateDart(planes);
    sw.stop();
    debugPrint('[Dart] concatenateYuvPlanes: ${sw.elapsedMilliseconds}ms '
        '→ ${dart.length} bytes');
  }

  /// Ví dụ 2: Downscale ảnh trước OCR — giảm ~50–70% thời gian ML Kit.
  static Future<Uint8List> prepareImageForOcr(Uint8List jpegBytes) async {
    final scaled = await NativePerfChannel.downscaleJpeg(jpegBytes, maxWidth: 960);
    return scaled ?? jpegBytes;
  }

  /// Ví dụ 3: Throttle adaptive — máy yếu quét chậm hơn, máy mạnh quét nhanh hơn.
  static Future<int> adaptiveScanIntervalMs() =>
      NativePerfChannel.suggestedScanIntervalMs();

  /// Ví dụ 4: Log thông tin thiết bị để tune perf trên QA.
  static Future<void> logDevicePerfHint() async {
    final hint = await NativePerfChannel.devicePerfHint();
    debugPrint('[Native] device perf hint: $hint');
  }

  static Uint8List _concatenateDart(List<Uint8List> planes) {
    final total = planes.fold<int>(0, (sum, p) => sum + p.length);
    final out = Uint8List(total);
    var offset = 0;
    for (final plane in planes) {
      out.setRange(offset, offset + plane.length, plane);
      offset += plane.length;
    }
    return out;
  }
}
