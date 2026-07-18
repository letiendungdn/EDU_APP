import 'package:flutter_appauth/flutter_appauth.dart';

import 'keycloak_config.dart';

class KeycloakOidcResult {
  KeycloakOidcResult({required this.accessToken, this.idToken});
  final String accessToken;
  final String? idToken;
}

class KeycloakOidc {
  KeycloakOidc([FlutterAppAuth? appAuth])
      : _appAuth = appAuth ?? const FlutterAppAuth();

  final FlutterAppAuth _appAuth;

  Future<KeycloakOidcResult> login() async {
    final result = await _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        KeycloakConfig.clientId,
        KeycloakConfig.redirectUrl,
        discoveryUrl: KeycloakConfig.discoveryUrl,
        scopes: const ['openid', 'profile', 'email'],
        promptValues: const ['login'],
      ),
    );

    final access = result.accessToken;
    if (access == null || access.isEmpty) {
      throw StateError('Keycloak không trả access_token');
    }
    return KeycloakOidcResult(
      accessToken: access,
      idToken: result.idToken,
    );
  }
}
