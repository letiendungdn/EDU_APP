# Lộ trình Flutter — Từ cơ bản đến Senior

Dùng project Nihongo (`apps/nihongo_flutter/`) làm ví dụ xuyên suốt.

---

## GIAI ĐOẠN 1 — DART + FLUTTER NỀN TẢNG (tháng 1–2)

### Dart cơ bản

```dart
// 1. Sound null safety — Dart 2.12+
String name = 'Nihongo';      // non-nullable
String? name = null;           // nullable
final length = name?.length ?? 0;

// 2. Named + optional parameters
class Vocabulary {
  final int id;
  final String kana;
  final String meaning;
  final int lessonNumber;
  
  const Vocabulary({
    required this.id,
    required this.kana,
    required this.meaning,
    required this.lessonNumber,
  });
  
  // copyWith — như copy() trong Kotlin data class
  Vocabulary copyWith({ String? meaning }) => Vocabulary(
    id: id,
    kana: kana,
    meaning: meaning ?? this.meaning,
    lessonNumber: lessonNumber,
  );
}

// 3. Sealed class (Dart 3.0+)
sealed class SrsResult {}
class Again extends SrsResult { final int intervalDays; const Again(this.intervalDays); }
class Good  extends SrsResult { final int intervalDays; const Good(this.intervalDays); }
class Easy  extends SrsResult { final int intervalDays; const Easy(this.intervalDays); }

// Pattern matching với switch expression
final message = switch (result) {
  Again(:final intervalDays) => 'Ôn lại sau $intervalDays ngày',
  Good(:final intervalDays)  => 'Tốt! Ôn lại sau $intervalDays ngày',
  Easy(:final intervalDays)  => 'Dễ! Ôn lại sau $intervalDays ngày',
};

// 4. Extension methods
extension JapaneseStringExtension on String {
  bool get isKana => split('').every((c) {
    final code = c.codeUnitAt(0);
    return (code >= 0x3040 && code <= 0x309F) ||  // Hiragana
           (code >= 0x30A0 && code <= 0x30FF);     // Katakana
  });
}

'おはよう'.isKana  // true
'hello'.isKana    // false

// 5. Future vs Stream
Future<List<Vocabulary>> fetchOnce();        // 1 giá trị, sau đó done
Stream<List<Vocabulary>> watchLiveUpdates(); // nhiều giá trị theo thời gian
```

---

### Widget fundamentals

```dart
// StatelessWidget — render từ props, không có internal state
class VocabCard extends StatelessWidget {
  final Vocabulary vocab;
  final VoidCallback onPlayTts;
  
  const VocabCard({
    super.key,
    required this.vocab,
    required this.onPlayTts,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(vocab.kana, style: Theme.of(context).textTheme.titleMedium),
        subtitle: Text(vocab.meaning),
        trailing: IconButton(
          icon: const Icon(Icons.volume_up),
          onPressed: onPlayTts,
        ),
      ),
    );
  }
}

// StatefulWidget — khi state sống trong widget đó (animation, form)
class FlipCard extends StatefulWidget {
  final Vocabulary vocab;
  const FlipCard({ super.key, required this.vocab });
  
  @override
  State<FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<FlipCard> {
  bool _isFlipped = false;
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _isFlipped = !_isFlipped),
      child: Text(_isFlipped ? widget.vocab.meaning : widget.vocab.kana),
    );
  }
}
```

---

## GIAI ĐOẠN 2 — CLEAN ARCHITECTURE (tháng 3–4)

### Cấu trúc project Nihongo

```
apps/nihongo_flutter/lib/
  domain/                     ← không phụ thuộc framework nào
    entity/
      vocabulary.dart          Vocabulary model
      srs_card.dart            SrsCard model (SM-2)
    repository/
      vocabulary_repository.dart    interface
    usecase/
      get_review_queue_usecase.dart  business logic
  data/                       ← implement domain interfaces
    datasource/
      local/                   Drift DAO
      remote/                  Dio API client
    repository/
      vocabulary_repository_impl.dart  offline-first sync
    model/
      vocabulary_dto.dart      JSON ↔ Entity mapping
  presentation/               ← Flutter widgets + Riverpod
    providers.dart             Riverpod providers
    vocab/
      vocab_screen.dart        ConsumerWidget
    srs/
      srs_screen.dart
    kanji_draw/
      kanji_draw_screen.dart   CustomPainter
    pronunciation/
      pronunciation_screen.dart
    ai_tutor/
      ai_tutor_screen.dart
  presentation/
    app.dart                   GoRouter routes
```

---

### Domain Layer

```dart
// Entity — pure Dart, không import Flutter
// apps/nihongo_flutter/lib/domain/entity/srs_card.dart
class SrsCard {
  final int vocabId;
  final double easeFactor;
  final int interval;
  final int repetitions;
  final DateTime nextReviewAt;
  
  const SrsCard({
    required this.vocabId,
    required this.easeFactor,
    required this.interval,
    required this.repetitions,
    required this.nextReviewAt,
  });
  
  // SM-2 algorithm
  SrsCard review(int quality) {  // quality 0–5
    if (quality < 3) {
      return copyWith(repetitions: 0, interval: 1,
                      nextReviewAt: DateTime.now().add(const Duration(days: 1)));
    }
    final newEase = (easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
                    .clamp(1.3, 2.5);
    final newInterval = repetitions == 0 ? 1 : repetitions == 1 ? 6 : (interval * newEase).round();
    return copyWith(
      easeFactor: newEase,
      interval: newInterval,
      repetitions: repetitions + 1,
      nextReviewAt: DateTime.now().add(Duration(days: newInterval)),
    );
  }
}

// Repository interface — domain layer define, data layer implement
abstract class VocabularyRepository {
  Stream<List<Vocabulary>> watchVocabByLesson(int lesson);
  Future<List<SrsCard>> getReviewQueue();
  Future<void> updateSrsCard(SrsCard card);
  Future<void> syncAllPending();
}

// UseCase — 1 class = 1 business operation
// apps/nihongo_flutter/lib/domain/usecase/get_review_queue_usecase.dart
class GetReviewQueueUseCase {
  final VocabularyRepository _repository;
  const GetReviewQueueUseCase(this._repository);
  
  Future<List<SrsCard>> call() async {
    final all = await _repository.getReviewQueue();
    final now = DateTime.now();
    // Business rule: chỉ lấy card đã đến hạn
    return all.where((card) => !card.nextReviewAt.isAfter(now)).toList();
  }
}
```

---

### Data Layer — Offline-first

```dart
// apps/nihongo_flutter/lib/data/repository/vocabulary_repository_impl.dart
class VocabularyRepositoryImpl implements VocabularyRepository {
  final VocabDao _dao;
  final VocabApiService _api;
  final ConnectivityPlus _connectivity;
  final AuthRepository _auth;
  
  @override
  Stream<List<Vocabulary>> watchVocabByLesson(int lesson) {
    // Drift Stream — tự emit khi DB thay đổi
    return _dao.watchVocabByLesson(lesson).map(
      (rows) => rows.map(VocabularyMapper.fromDrift).toList(),
    );
  }
  
  @override
  Future<void> updateSrsCard(SrsCard card) async {
    // 1. Write local ngay — UI không lag
    await _dao.upsertSrsCard(SrsCardMapper.toDrift(card));
    
    // 2. Queue for sync
    await _dao.enqueueSyncItem(card.vocabId, 'srs_update');
    
    // 3. Flush nếu online + đã đăng nhập
    final isOnline = await _connectivity.checkConnectivity() != ConnectivityResult.none;
    final isAuth = await _auth.isAuthenticated();
    if (isOnline && isAuth) {
      await syncAllPending();
    }
  }
  
  @override
  Future<void> syncAllPending() async {
    final pending = await _dao.getPendingSync();
    if (pending.isEmpty) return;
    
    // Gọi API thật
    await _api.syncReviewBank(
      pending.map((item) => ReviewSyncDto(
        vocabId: item.vocabId,
        easeFactor: item.easeFactor,
        interval: item.interval,
        nextReviewAt: item.nextReviewAt,
      )).toList(),
    );
    
    // Mark synced sau khi API thành công
    await _dao.markSrsSynced(pending.map((item) => item.vocabId).toList());
  }
}
```

---

### Presentation Layer — Riverpod

```dart
// apps/nihongo_flutter/lib/presentation/providers.dart
// Providers — tương đương DI container

// Repository providers
final vocabRepositoryProvider = Provider<VocabularyRepository>((ref) {
  final dao = ref.watch(vocabDaoProvider);
  final api = ref.watch(vocabApiProvider);
  final connectivity = ref.watch(connectivityProvider);
  final auth = ref.watch(authRepositoryProvider);
  return VocabularyRepositoryImpl(dao, api, connectivity, auth);
});

// UseCase provider
final getReviewQueueProvider = Provider<GetReviewQueueUseCase>((ref) {
  return GetReviewQueueUseCase(ref.watch(vocabRepositoryProvider));
});

// StreamProvider — reactive data từ DB
final vocabByLessonProvider = StreamProvider.family<List<Vocabulary>, int>((ref, lesson) {
  return ref.watch(vocabRepositoryProvider).watchVocabByLesson(lesson);
});

// FutureProvider — one-time load
final reviewQueueProvider = FutureProvider<List<SrsCard>>((ref) async {
  return ref.watch(getReviewQueueProvider).call();
});

// StateNotifier cho SRS session
class SrsSessionNotifier extends StateNotifier<SrsSessionState> {
  final VocabularyRepository _repo;
  
  SrsSessionNotifier(this._repo) : super(const SrsSessionState());
  
  Future<void> answer(SrsCard card, int quality) async {
    final updated = card.review(quality);
    await _repo.updateSrsCard(updated);
    state = state.advance();  // next card
  }
}

final srsSessionProvider = StateNotifierProvider<SrsSessionNotifier, SrsSessionState>((ref) {
  return SrsSessionNotifier(ref.watch(vocabRepositoryProvider));
});

// ConsumerWidget — subscribe to providers
class SrsScreen extends ConsumerWidget {
  const SrsScreen({ super.key });
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queue = ref.watch(reviewQueueProvider);
    
    return queue.when(
      loading: () => const CircularProgressIndicator(),
      error: (e, _) => Text('Lỗi: $e'),
      data: (cards) => cards.isEmpty
          ? const Text('Đã ôn hết hôm nay! 🎉')
          : SrsCardView(card: cards.first),
    );
  }
}
```

---

## GIAI ĐOẠN 3 — TÍNH NĂNG (tháng 5–6)

### Drift ORM (Local Database)

```dart
// Schema definition
class VocabularyTable extends Table {
  IntColumn get id => integer()();
  TextColumn get kana => text()();
  TextColumn get meaning => text()();
  IntColumn get lessonNumber => integer()();
  IntColumn get sortOrder => integer()();
  TextColumn get syncStatus => text().withDefault(const Constant('pending'))();
  
  @override
  Set<Column> get primaryKey => { id };
}

class SrsCardTable extends Table {
  IntColumn get vocabId => integer().references(VocabularyTable, #id)();
  RealColumn get easeFactor => real().withDefault(const Constant(2.5))();
  IntColumn get intervalDays => integer().withDefault(const Constant(1))();
  IntColumn get repetitions => integer().withDefault(const Constant(0))();
  DateTimeColumn get nextReviewAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get syncStatus => text().withDefault(const Constant('pending'))();
}

// DAO
class VocabDao extends DatabaseAccessor<AppDatabase> with _$VocabDaoMixin {
  // Stream reactive — UI tự rebuild khi DB thay đổi
  Stream<List<VocabularyTableData>> watchVocabByLesson(int lesson) {
    return (select(vocabularyTable)
      ..where((t) => t.lessonNumber.equals(lesson))
      ..orderBy([(t) => OrderingTerm.asc(t.sortOrder)])
    ).watch();
  }
  
  // Offline sync
  Future<List<SrsCardTableData>> getPendingSync() {
    return (select(srsCardTable)
      ..where((t) => t.syncStatus.equals('pending'))
    ).get();
  }
  
  Future<void> markSrsSynced(List<int> vocabIds) {
    return (update(srsCardTable)
      ..where((t) => t.vocabId.isIn(vocabIds))
    ).write(const SrsCardTableCompanion(syncStatus: Value('synced')));
  }
}
```

---

### CustomPainter — Kanji Draw Screen

```dart
// apps/nihongo_flutter/lib/presentation/kanji_draw/kanji_draw_screen.dart
class _KanjiCanvas extends StatefulWidget {
  const _KanjiCanvas();
  
  @override
  State<_KanjiCanvas> createState() => _KanjiCanvasState();
}

class _KanjiCanvasState extends State<_KanjiCanvas> {
  final List<List<Offset>> _strokes = [];
  List<Offset> _currentStroke = [];
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (d) => setState(() => _currentStroke = [d.localPosition]),
      onPanUpdate: (d) => setState(() => _currentStroke.add(d.localPosition)),
      onPanEnd: (_) => setState(() {
        if (_currentStroke.length > 2) _strokes.add(List.of(_currentStroke));
        _currentStroke = [];
      }),
      child: CustomPaint(
        painter: _KanjiPainter(strokes: _strokes, current: _currentStroke),
        size: Size.infinite,
      ),
    );
  }
}

class _KanjiPainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final List<Offset> current;
  
  const _KanjiPainter({ required this.strokes, required this.current });
  
  @override
  void paint(Canvas canvas, Size size) {
    _drawGrid(canvas, size);
    _drawStrokes(canvas, [...strokes, current]);
  }
  
  void _drawGrid(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 0.5;
    canvas.drawLine(Offset(size.width / 2, 0), Offset(size.width / 2, size.height), paint);
    canvas.drawLine(Offset(0, size.height / 2), Offset(size.width, size.height / 2), paint);
  }
  
  void _drawStrokes(Canvas canvas, List<List<Offset>> allStrokes) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;
    
    for (final stroke in allStrokes) {
      if (stroke.length < 2) continue;
      final path = Path()..moveTo(stroke[0].dx, stroke[0].dy);
      for (final p in stroke.skip(1)) path.lineTo(p.dx, p.dy);
      canvas.drawPath(path, paint);
    }
  }
  
  @override
  bool shouldRepaint(_KanjiPainter old) =>
      old.strokes != strokes || old.current != current;
}
```

---

### GoRouter Navigation

```dart
// apps/nihongo_flutter/lib/presentation/app.dart
final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/vocab', builder: (_, __) => const VocabScreen()),
    GoRoute(path: '/srs', builder: (_, __) => const SrsScreen()),
    GoRoute(path: '/ai-tutor', builder: (_, __) => const AiTutorScreen()),
    GoRoute(
      path: '/pronunciation',
      builder: (_, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return PronunciationScreen(
          kana: extra?['kana'] as String? ?? '',
          meaning: extra?['meaning'] as String? ?? '',
        );
      },
    ),
    GoRoute(
      path: '/kanji-draw',
      builder: (_, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return KanjiDrawScreen(
          kanji: extra?['kanji'] as String? ?? '日',
          kana: extra?['kana'] as String? ?? 'にち',
        );
      },
    ),
    GoRoute(path: '/live', builder: (_, __) => const LiveScreen()),
  ],
);

// Navigate
context.push('/pronunciation', extra: {'kana': 'おはよう', 'meaning': 'Xin chào buổi sáng'});
context.go('/srs');
```

---

## GIAI ĐOẠN 4 — SENIOR FEATURES (tháng 7–8)

### Animation nâng cao

```dart
// Swipe card animation — tương đương SwipeCard gesture trong roadmap senior
class SwipeCard extends StatefulWidget {
  final SrsCard card;
  final void Function(int quality) onAnswer;
  const SwipeCard({ super.key, required this.card, required this.onAnswer });
  
  @override
  State<SwipeCard> createState() => _SwipeCardState();
}

class _SwipeCardState extends State<SwipeCard> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  Offset _dragOffset = Offset.zero;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
  }
  
  @override
  void dispose() {
    _controller.dispose();  // QUAN TRỌNG: tránh memory leak
    super.dispose();
  }
  
  void _onDragEnd(DragEndDetails details) {
    final velocity = details.velocity.pixelsPerSecond.dx;
    final distance = _dragOffset.dx;
    
    if (distance > 120 || velocity > 500) {
      // Swipe right — Good (4)
      _flyOff(1.0, quality: 4);
    } else if (distance < -120 || velocity < -500) {
      // Swipe left — Again (1)
      _flyOff(-1.0, quality: 1);
    } else {
      // Return to center
      setState(() => _dragOffset = Offset.zero);
    }
  }
  
  void _flyOff(double direction, { required int quality }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final tween = Tween<Offset>(
      begin: _dragOffset,
      end: Offset(direction * screenWidth * 1.5, _dragOffset.dy),
    );
    
    final animation = tween.animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut)
    );
    
    animation.addListener(() => setState(() => _dragOffset = animation.value));
    _controller.forward().then((_) {
      widget.onAnswer(quality);
      _controller.reset();
      setState(() => _dragOffset = Offset.zero);
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final angle = _dragOffset.dx / 400;
    
    return GestureDetector(
      onHorizontalDragUpdate: (d) => setState(() => _dragOffset += Offset(d.delta.dx, 0)),
      onHorizontalDragEnd: _onDragEnd,
      child: Transform.translate(
        offset: _dragOffset,
        child: Transform.rotate(
          angle: angle,
          child: SrsCardWidget(card: widget.card),
        ),
      ),
    );
  }
}
```

---

### Gemini AI Integration

```dart
// apps/nihongo_flutter/lib/presentation/ai_tutor/ai_tutor_screen.dart
// Backend xử lý Gemini, Flutter chỉ gọi API

class AiTutorScreen extends ConsumerStatefulWidget {
  const AiTutorScreen({ super.key });
  
  @override
  ConsumerState<AiTutorScreen> createState() => _AiTutorScreenState();
}

class _AiTutorScreenState extends ConsumerState<AiTutorScreen> {
  final _controller = TextEditingController();
  final _messages = <ChatMessage>[];
  bool _isLoading = false;
  
  @override
  void dispose() {
    _controller.dispose();  // tránh leak
    super.dispose();
  }
  
  Future<void> _send(String text) async {
    setState(() {
      _messages.add(ChatMessage(role: 'user', content: text));
      _isLoading = true;
    });
    _controller.clear();
    
    try {
      final api = ref.read(aiApiProvider);
      final response = await api.chat(messages: _messages);
      setState(() {
        _messages.add(ChatMessage(role: 'assistant', content: response));
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }
}
```

---

### Testing

```dart
// Widget test
void main() {
  testWidgets('SrsScreen shows card when queue not empty', (tester) async {
    final mockRepo = MockVocabularyRepository();
    when(() => mockRepo.getReviewQueue()).thenAnswer((_) async => [fakeSrsCard]);
    
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          vocabRepositoryProvider.overrideWithValue(mockRepo),
        ],
        child: const MaterialApp(home: SrsScreen()),
      ),
    );
    
    await tester.pumpAndSettle();
    
    expect(find.byType(SrsCardWidget), findsOneWidget);
    expect(find.text('おはよう'), findsOneWidget);
  });
  
  testWidgets('shows completion when queue empty', (tester) async {
    final mockRepo = MockVocabularyRepository();
    when(() => mockRepo.getReviewQueue()).thenAnswer((_) async => []);
    
    await tester.pumpWidget(
      ProviderScope(
        overrides: [vocabRepositoryProvider.overrideWithValue(mockRepo)],
        child: const MaterialApp(home: SrsScreen()),
      ),
    );
    
    await tester.pumpAndSettle();
    expect(find.text('Đã ôn hết hôm nay! 🎉'), findsOneWidget);
  });
}

// Unit test UseCase
test('GetReviewQueueUseCase only returns due cards', () async {
  final now = DateTime.now();
  final mockRepo = MockVocabularyRepository();
  
  when(() => mockRepo.getReviewQueue()).thenAnswer((_) async => [
    fakeSrsCard(nextReviewAt: now.subtract(const Duration(hours: 1))),  // due
    fakeSrsCard(nextReviewAt: now.add(const Duration(days: 1))),         // not due
  ]);
  
  final result = await GetReviewQueueUseCase(mockRepo).call();
  
  expect(result.length, 1);
});
```

---

### CI/CD

```yaml
# .github/workflows/flutter-ci.yml
name: Flutter CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.24.x', cache: true }
      - working-directory: apps/nihongo_flutter
        run: |
          flutter pub get
          flutter analyze --no-fatal-infos
          flutter test --coverage

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - working-directory: apps/nihongo_flutter
        run: eas build --platform android --profile preview --non-interactive
```

---

## CHECKLIST

```
Giai đoạn 1 — Dart + Flutter cơ bản:
  □ Dart null safety, sealed class (Dart 3), extension
  □ StatelessWidget, StatefulWidget, build(), setState
  □ ListView.builder, Column, Row, Expanded, Flexible
  □ Theme, MediaQuery, context
  □ dispose() pattern: AnimationController, TextEditingController

Giai đoạn 2 — Clean Architecture:
  □ Domain layer: Entity, Repository interface, UseCase
  □ Data layer: RepositoryImpl, DAO, Mapper
  □ Presentation layer: ConsumerWidget, Provider
  □ Dependency direction: Presentation → Domain ← Data

Giai đoạn 3 — Features:
  □ Riverpod: Provider, StreamProvider, FutureProvider, StateNotifier
  □ ref.watch vs ref.read
  □ Drift: Table, DAO, Stream query, upsert
  □ GoRouter: routes, push, extra params
  □ Dio + interceptors (auth header, retry 401)

Giai đoạn 4 — Senior:
  □ CustomPainter + shouldRepaint
  □ AnimationController + physics animation
  □ Platform Channel (MethodChannel)
  □ flutter_tts + speech_to_text
  □ Widget test + Riverpod override
  □ EAS Build + GitHub Actions CI
  □ flutter_lints, analyze clean
```

---

## RESOURCES

- **Official**: flutter.dev/docs (Material 3, API reference)
- **Riverpod**: riverpod.dev (docs + examples)
- **Drift**: drift.simonbinder.eu
- **Architecture**: Very Good Ventures blog (VGV)
- **YouTube**: Reso Coder, Flutter Explained, Robert Brunhage
- **Book**: Flutter in Action (Manning)
- **Newsletter**: Flutter Weekly
- **Project thực tế**: apps/nihongo_flutter/ trong repo này
