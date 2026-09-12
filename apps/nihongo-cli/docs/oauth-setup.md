# OAuth 2.0 / OIDC Setup cho nihongo-cli

## 1. Android — Deep Link (redirect URI)

Thêm vào `android/app/build.gradle`:
```gradle
android {
  defaultConfig {
    manifestPlaceholders = [
      appAuthRedirectScheme: "com.nihongocli"
    ]
  }
}
```

react-native-app-auth tự thêm `intent-filter` dựa trên `appAuthRedirectScheme`.

## 2. iOS — URL Scheme

Thêm vào `ios/NihongoCLI/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.nihongocli</string>
    </array>
  </dict>
</array>
```

## 3. Google Sign-In

Thêm vào `ios/NihongoCLI/AppDelegate.mm`:
```objc
#import <RNGoogleSignin/RNGoogleSignin.h>

- (BOOL)application:(UIApplication *)application
    openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RNGoogleSignin application:application openURL:url options:options];
}
```

iOS: thêm `GoogleService-Info.plist` từ Firebase Console vào Xcode project.
Android: thêm `google-services.json` vào `android/app/`.

## 4. Keycloak Client config

Trong Keycloak Admin → Realm `edu-app` → Clients → New:
- Client ID: `nihongo-mobile`
- Client type: **Public** (không có client secret)
- Valid redirect URIs: `com.nihongocli://oauth/callback`
- Web origins: `com.nihongocli://`
- Standard flow: ✅ ON
- Direct access grants: ❌ OFF (không dùng password grant trên mobile)

## 5. GitHub Secrets cần thêm

```
GOOGLE_WEB_CLIENT_ID=343309611106-xxx.apps.googleusercontent.com
```
