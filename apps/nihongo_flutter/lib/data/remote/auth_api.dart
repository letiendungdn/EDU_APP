import 'package:dio/dio.dart';

import '../local/token_store.dart';

String? _extractAccessToken(dynamic data) {
  if (data is! Map) return null;
  final map = Map<String, dynamic>.from(data);
  final nested = map['data'];
  if (nested is Map && nested['access_token'] is String) {
    return nested['access_token'] as String;
  }
  final direct = map['access_token'];
  return direct is String ? direct : null;
}

class AuthApi {
  AuthApi(this._dio, this._tokenStore);
  final Dio _dio;
  final TokenStore _tokenStore;

  Future<void> login({required String email, required String password}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final token = _extractAccessToken(res.data);
    if (token == null || token.isEmpty) {
      throw DioException(
        requestOptions: res.requestOptions,
        message: 'Không nhận được access token',
      );
    }
    await _tokenStore.saveAccessToken(token);
  }

  Future<void> loginWithOidc({
    required String accessToken,
    String? idToken,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/auth/oidc',
      data: {
        'accessToken': accessToken,
        if (idToken != null && idToken.isNotEmpty) 'idToken': idToken,
      },
    );
    final token = _extractAccessToken(res.data);
    if (token == null || token.isEmpty) {
      throw DioException(
        requestOptions: res.requestOptions,
        message: 'Không nhận được access token từ OIDC',
      );
    }
    await _tokenStore.saveAccessToken(token);
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } finally {
      await _tokenStore.clear();
    }
  }
}
