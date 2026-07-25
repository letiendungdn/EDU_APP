import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Registers a stable device token with backend `/push/register`.
/// Without Firebase `google-services.json`, uses a persisted local device id
/// so logout can unregister. Swap for FCM token when Firebase is configured.
class PushService {
  PushService(this._dio);

  final Dio _dio;
  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'push_device_token';

  Future<String> _ensureToken() async {
    final existing = await _storage.read(key: _tokenKey);
    if (existing != null && existing.isNotEmpty) return existing;

    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString('device_install_id');
    if (id == null || id.isEmpty) {
      id = const Uuid().v4();
      await prefs.setString('device_install_id', id);
    }
    final platform = kIsWeb
        ? 'android'
        : (Platform.isIOS ? 'ios' : 'android');
    final token = '$platform-$id';
    await _storage.write(key: _tokenKey, value: token);
    return token;
  }

  Future<void> registerAfterLogin() async {
    try {
      final token = await _ensureToken();
      final platform = kIsWeb
          ? 'android'
          : (Platform.isIOS ? 'ios' : 'android');
      await _dio.post(
        '/push/register',
        data: {'token': token, 'platform': platform},
      );
    } catch (_) {
      // Backend offline — ignore
    }
  }

  Future<void> unregisterOnLogout() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null) return;
    try {
      await _dio.delete('/push/unregister', data: {'token': token});
    } catch (_) {}
    await _storage.delete(key: _tokenKey);
  }
}
