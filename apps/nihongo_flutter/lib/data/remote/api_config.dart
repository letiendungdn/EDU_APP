class ApiConfig {
  /// Android emulator → host machine qua nginx.
  /// Đổi khi chạy máy thật: flutter run --dart-define=API_BASE_URL=http://192.168.x.x:8080/api
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080/api',
  );
}
