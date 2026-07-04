# Lộ trình Senior Mobile — 11 tuần thực hành

Từ project Nihongo hiện tại, code thật, không lý thuyết suông.

---

## Tuần 1–2: Fix flushSyncQueue + Sentry

### Bug root cause

```typescript
// ❌ SAI — mark synced mà không gọi API
async flushSyncQueue() {
  const pending = await db.vocabulary
    .filter(v => v.syncStatus === 'pending').toArray();
  // BUG: không có API call nào ở đây
  await db.vocabulary
    .where('syncStatus').equals('pending')
    .modify({ syncStatus: 'synced' });
}
```

```typescript
// ✅ ĐÚNG — gọi API trước, update local sau
// apps/nihongo-mobile/src/database/sync.ts
async flushSyncQueue() {
  if (!(await isOnline())) return;

  const pending = await db.vocabulary
    .filter(v => v.syncStatus === 'pending').toArray();
  if (!pending.length) return;

  try {
    // 1. Gọi API thật
    await vocabularyApi.bulkUpsert(
      pending.map(v => ({
        id: v.remoteId,
        progress: v.progress,
        lastReviewedAt: v.lastReviewedAt,
      }))
    );
    // 2. CHỈ mark synced sau khi API thành công
    await db.vocabulary
      .where('id').anyOf(pending.map(v => v.id))
      .modify({ syncStatus: 'synced' });

  } catch (err) {
    // Giữ status = pending → retry tự động lần sau
    console.warn('Sync failed, will retry:', err);
  }
}
```

### Sentry setup — Flutter

```dart
// apps/nihongo_flutter/lib/main.dart
// pubspec: sentry_flutter: ^8.9.0
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment('SENTRY_DSN');
      options.tracesSampleRate = 0.1;
      options.environment = kDebugMode ? 'debug' : 'production';
      // KHÔNG gửi PII — tránh vi phạm GDPR
      options.beforeSend = (event, hint) => event.copyWith(user: null);
    },
    appRunner: () => runApp(const ProviderScope(child: NihongoApp())),
  );
}
```

**Checklist:**
- [ ] Tìm đúng nơi trong `flushSyncQueue` cần thêm API call
- [ ] Viết endpoint `POST /vocabulary/bulk-upsert` nếu chưa có
- [ ] Test offline: tắt wifi → tạo progress → bật wifi → verify server nhận dữ liệu
- [ ] Đăng ký Sentry free, thêm `SENTRY_DSN` vào `.env` (không commit)
- [ ] Trigger 1 exception giả để verify Sentry nhận được

---

## Tuần 3–4: Push Notifications (FCM)

```dart
// pubspec: firebase_messaging: ^15.1.0, flutter_local_notifications: ^18.0.0
// Setup: dart pub global activate flutterfire_cli && flutterfire configure

// apps/nihongo_flutter/lib/notifications/push_service.dart
class PushService {
  static Future<void> init(GoRouter router, AuthApi authApi) async {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    final msg = FirebaseMessaging.instance;
    await msg.requestPermission(alert: true, badge: true, sound: true);

    final token = await msg.getToken();
    if (token != null) await authApi.saveDeviceToken(token);

    // [1] Foreground — app đang mở
    FirebaseMessaging.onMessage.listen(_showLocalNotif);

    // [2] Background — user tap notification
    FirebaseMessaging.onMessageOpenedApp
        .listen((m) => _handleTap(m.data, router));

    // [3] Killed — app khởi động từ notification
    final initial = await msg.getInitialMessage();
    if (initial != null) _handleTap(initial.data, router);
  }

  static void _handleTap(Map<String, dynamic> data, GoRouter router) {
    switch (data['type']) {
      case 'SRS_REMINDER': router.push('/srs'); break;
      case 'LIVE_SESSION': router.push('/live'); break;
    }
  }
}
```

```typescript
// services/api-gateway/src/notification/notification.service.ts
@Injectable()
export class NotificationService {
  async sendToUser(userId: number, payload: {
    title: string; body: string; data?: Record<string, string>;
  }) {
    const tokens = await this.prisma.deviceToken.findMany({ where: { userId } });
    if (!tokens.length) return;
    await admin.messaging().sendEachForMulticast({
      tokens: tokens.map(t => t.token),
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  }

  // Kafka consumer — trigger khi coach bắt đầu live
  @EventPattern('edu.live.started')
  async onLiveStarted(event: LiveStartedEvent) {
    const followers = await this.getFollowers(event.coachId);
    for (const userId of followers) {
      await this.sendToUser(userId, {
        title: `${event.coachName} đang livestream`,
        body: event.title,
        data: { type: 'LIVE_SESSION', sessionId: event.sessionId },
      });
    }
  }
}
```

**Checklist:**
- [ ] Tạo Firebase project, chạy `flutterfire configure`
- [ ] Test trên device thật (emulator không nhận FCM)
- [ ] Thêm bảng `DeviceToken` vào schema Prisma
- [ ] Handle đủ 3 trạng thái: foreground, background, killed
- [ ] Scheduled job gửi SRS reminder lúc 8h sáng mỗi ngày

---

## Tuần 5–6: CI/CD — GitHub Actions + EAS Build

```yaml
# .github/workflows/flutter.yml
name: Flutter CI
on:
  push:
    branches: [main]
    paths: ['apps/nihongo_flutter/**']
  pull_request:
    paths: ['apps/nihongo_flutter/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.27.x', cache: true }
      - run: cd apps/nihongo_flutter && flutter pub get
      - run: cd apps/nihongo_flutter && flutter analyze --fatal-infos
      - run: cd apps/nihongo_flutter && flutter test --coverage

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.27.x', cache: true }
      - run: cd apps/nihongo_flutter && flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: release-apk
          path: apps/nihongo_flutter/build/app/outputs/flutter-apk/app-release.apk
```

```bash
# EAS Build — Expo
npm install -g eas-cli && eas login
cd apps/nihongo-mobile && eas init
eas build --profile preview --platform android --non-interactive
```

```json
// apps/nihongo-mobile/eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": { "distribution": "store" }
    }
  }
}
```

**Checklist:**
- [ ] Flutter workflow — verify xanh trên PR đầu tiên
- [ ] EAS Build chạy thành công, download APK cài được trên device
- [ ] Thêm `EXPO_TOKEN` vào GitHub Secrets
- [ ] Fix hết warning từ `flutter analyze --fatal-infos`

---

## Tuần 7–8: Swipe Gesture SRS (Tinder-style)

Swipe phải = biết (SM-2 quality 5), trái = quên (quality 0).

```dart
// apps/nihongo_flutter/lib/presentation/srs/swipe_card.dart
class SwipeCard extends StatefulWidget {
  const SwipeCard({required this.card, required this.onSwipe, super.key});
  final ReviewCard card;
  final void Function(int quality) onSwipe;
  @override
  State<SwipeCard> createState() => _SwipeCardState();
}

class _SwipeCardState extends State<SwipeCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  Offset _drag = Offset.zero;
  double _rot = 0;
  bool _flipped = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 250));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); } // tránh memory leak

  void _onPanUpdate(DragUpdateDetails d) => setState(() {
    _drag += d.delta;
    _rot = (_drag.dx / 300).clamp(-0.4, 0.4);
  });

  void _onPanEnd(DragEndDetails _) {
    final threshold = context.size!.width * 0.35;
    if (_drag.dx > threshold)       _flyOff(right: true);
    else if (_drag.dx < -threshold) _flyOff(right: false);
    else setState(() { _drag = Offset.zero; _rot = 0; });
  }

  void _flyOff({required bool right}) {
    final w = MediaQuery.of(context).size.width;
    final anim = Tween<Offset>(
      begin: _drag,
      end: Offset(right ? w * 1.5 : -w * 1.5, _drag.dy),
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    anim.addListener(() => setState(() => _drag = anim.value));
    _ctrl.forward().then((_) => widget.onSwipe(right ? 5 : 0));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanUpdate: _onPanUpdate,
      onPanEnd: _onPanEnd,
      onTap: () => setState(() => _flipped = !_flipped),
      child: Transform.translate(
        offset: _drag,
        child: Transform.rotate(
          angle: _rot,
          child: Stack(children: [
            _CardFace(card: widget.card, flipped: _flipped),
            if (_drag.dx > 20)
              Positioned(top: 16, left: 16,
                child: _SwipeLabel(text: 'BIẾT', color: Colors.green)),
            if (_drag.dx < -20)
              Positioned(top: 16, right: 16,
                child: _SwipeLabel(text: 'QUÊN', color: Colors.red)),
          ]),
        ),
      ),
    );
  }
}
```

**Checklist:**
- [ ] Dispose `AnimationController` trong `dispose()` — bắt buộc
- [ ] Overlay BIẾT/QUÊN xuất hiện khi kéo > 20px
- [ ] Tap card để flip front/back
- [ ] Kiểm tra DevTools Memory tab — không leak khi navigate back

---

## Tuần 9–10: Widget Tests + Maestro E2E

### Widget test với Riverpod + mocktail

```dart
// pubspec dev_dependencies: mocktail: ^0.3.0
// test/srs_screen_test.dart
class MockVocabRepo extends Mock implements VocabularyRepository {}

void main() {
  testWidgets('hiện empty state khi không có thẻ', (tester) async {
    final mock = MockVocabRepo();
    when(() => mock.watchReviewQueue())
        .thenAnswer((_) => Stream.value([]));

    await tester.pumpWidget(
      ProviderScope(
        overrides: [vocabRepositoryProvider.overrideWithValue(mock)],
        child: const MaterialApp(home: SrsScreen()),
      ),
    );
    await tester.pump();

    expect(find.text('Không có thẻ cần ôn hôm nay'), findsOneWidget);
    expect(find.byType(SwipeCard), findsNothing);
  });

  testWidgets('swipe phải gọi updateSrsCard với quality=5', (tester) async {
    final mock = MockVocabRepo();
    when(() => mock.watchReviewQueue())
        .thenAnswer((_) => Stream.value([fakeCard()]));
    when(() => mock.updateSrsCard(any())).thenAnswer((_) async {});

    await tester.pumpWidget(ProviderScope(
      overrides: [vocabRepositoryProvider.overrideWithValue(mock)],
      child: const MaterialApp(home: SrsScreen()),
    ));
    await tester.pump();

    await tester.drag(find.byType(SwipeCard), const Offset(400, 0));
    await tester.pumpAndSettle();

    verify(() => mock.updateSrsCard(
      any(that: predicate<SrsCard>((c) => c.quality == 5)),
    )).called(1);
  });
}
```

### Maestro E2E

```bash
# Cài Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
```

```yaml
# .maestro/srs-review.yaml
appId: com.edu.nihongo
---
- launchApp
- tapOn: "Ôn tập SRS"
- assertVisible: "Xem đáp án"
- tapOn: "Xem đáp án"
- assertVisible: "Dễ"
- swipeLeft                       # quên
- assertVisible: "Xem đáp án"    # card tiếp theo
```

```bash
maestro test .maestro/srs-review.yaml
maestro test .maestro/   # chạy tất cả
```

**Checklist:**
- [ ] 3 widget test: empty state, swipe phải, swipe trái
- [ ] Maestro flow cho SRS và vocab screen
- [ ] `flutter test` chạy xanh trong CI

---

## Tuần 11+: Biometric · Deep Linking · Presigned URL

### Biometric

```dart
// pubspec: local_auth: ^2.3.0, flutter_secure_storage: ^9.2.0
class AuthService {
  final _auth = LocalAuthentication();
  static const _store = FlutterSecureStorage();

  Future<void> saveTokenSecurely(String token) =>
      _store.write(key: 'auth_token', value: token);

  Future<String?> tryBiometricLogin() async {
    if (!(await _auth.canCheckBiometrics)) return null;
    final ok = await _auth.authenticate(
      localizedReason: 'Xác thực để vào Nihongo',
      options: const AuthenticationOptions(biometricOnly: false, stickyAuth: true),
    );
    if (!ok) return null;
    return _store.read(key: 'auth_token');
  }
}
```

### Deep Linking (App Links — tốt hơn Custom Scheme)

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="https" android:host="nihongo.app" android:pathPrefix="/lesson"/>
</intent-filter>
```

```dart
// apps/nihongo_flutter/lib/presentation/app.dart
final _router = GoRouter(
  routes: [...],
  redirect: (context, state) {
    final uri = state.uri;
    // https://nihongo.app/lesson/5 → /vocab?lesson=5
    if (uri.host == 'nihongo.app' && uri.pathSegments.firstOrNull == 'lesson') {
      return '/vocab?lesson=${uri.pathSegments.elementAtOrNull(1)}';
    }
    return null;
  },
);
// Test: adb shell am start -a android.intent.action.VIEW -d "https://nihongo.app/lesson/1"
```

### Presigned URL Upload

```typescript
// services/api-gateway/src/upload/upload.controller.ts
@Post('presign')
async presign(@Body() dto: PresignDto) {
  const key = `uploads/${dto.userId}/${Date.now()}-${dto.filename}`;
  const uploadUrl = await this.s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: dto.mimeType,
    Expires: 300, // 5 phút TTL
  });
  return { uploadUrl, publicUrl: `https://${process.env.CDN_HOST}/${key}` };
}
```

```dart
// Flutter — upload thẳng lên S3, không qua server
Future<String> uploadAvatar(File file) async {
  final presign = await uploadApi.presign(
    filename: path.basename(file.path), mimeType: 'image/jpeg');

  final bytes = await file.readAsBytes();
  await Dio().put(
    presign.uploadUrl,
    data: Stream.fromIterable([bytes]),
    options: Options(headers: {'Content-Type': 'image/jpeg', 'Content-Length': bytes.length}),
  );

  await authApi.updateAvatar(presign.publicUrl);
  return presign.publicUrl;
}
```

**Checklist:**
- [ ] Biometric test trên device thật (emulator không hỗ trợ)
- [ ] App Links: host `assetlinks.json` tại `/.well-known/assetlinks.json`
- [ ] S3 bucket CORS: cho phép `PUT` từ mobile
- [ ] Presigned URL TTL ≤ 15 phút

---

## Câu hỏi phỏng vấn senior

**Q: App bạn xử lý offline như thế nào?**
A: Offline-first — mọi read/write qua local DB, sync queue flush khi online. Không phải "check network trước rồi mới làm".

**Q: Memory leak phổ biến nhất trong Flutter?**
A: `StreamSubscription` không cancel trong `dispose()`. `AnimationController` không dispose. `GlobalKey` giữ reference đến Widget đã unmount.

**Q: Tại sao dùng App Links thay vì Custom URL Scheme?**
A: Custom scheme (`myapp://`) dễ bị hijack bởi app khác. App Links (`https://`) cần verify domain ownership, an toàn hơn, và fallback về browser nếu app chưa cài.

**Q: Presigned URL là gì?**
A: URL tạm thời có TTL do server cấp, cho phép client upload thẳng lên S3 mà không qua server. Server không làm middleman cho bytes → tiết kiệm bandwidth và cost.
