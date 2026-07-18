import 'package:flutter/foundation.dart';

class ApiConfig {
  /// NestJS API Gateway chạy port 3000 (mặc định).
  ///
  /// Chrome (flutter web): http://localhost:3000/api
  /// Android emulator: 10.0.2.2 = host machine localhost
  /// Máy thật / staging: flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3000/api
  static String get baseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (kIsWeb) return 'http://localhost:3000/api';
    return 'http://10.0.2.2:3000/api';
  }
}
