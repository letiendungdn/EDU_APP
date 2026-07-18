import 'package:flutter/foundation.dart';

/// Keycloak OIDC (browser PKCE) → API `/auth/oidc` exchange.
class KeycloakConfig {
  static String get url {
    const fromEnv = String.fromEnvironment('KEYCLOAK_URL');
    if (fromEnv.isNotEmpty) return fromEnv.replaceAll(RegExp(r'/$'), '');
    if (kIsWeb) return 'http://auth.localhost:8080';
    // Android emulator → host nginx
    return 'http://10.0.2.2:8080';
  }

  static const realm = String.fromEnvironment(
    'KEYCLOAK_REALM',
    defaultValue: 'edu-app',
  );

  static const clientId = String.fromEnvironment(
    'KEYCLOAK_CLIENT_ID',
    defaultValue: 'nihongo-mobile',
  );

  static String get authority => '$url/realms/$realm';

  static String get discoveryUrl =>
      '$authority/.well-known/openid-configuration';

  /// Flutter Android/iOS AppAuth redirect.
  static const redirectUrl = 'com.edu.nihongo_app:/oauth2redirect';
}
