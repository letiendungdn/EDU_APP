import 'package:dio/dio.dart';

import '../local/token_store.dart';

class AuthApi {
  AuthApi(this._dio, this._tokenStore);
  final Dio _dio;
  final TokenStore _tokenStore;

  Future<void> login({required String email, required String password}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    final token = res.data?['access_token'] as String?;
    if (token == null || token.isEmpty) {
      throw DioException(
        requestOptions: res.requestOptions,
        message: 'Không nhận được access token',
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
