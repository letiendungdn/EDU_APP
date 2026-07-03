# Cursor Prompt — Flutter App (Offline-First, Senior Architecture)

## Bối cảnh

Tạo Flutter app cho EDU APP (học tiếng Nhật) với:
- **Offline-first**: đọc từ SQLite local, sync background
- **Clean Architecture**: Data → Domain → Presentation
- **Drift** (SQLite ORM type-safe) + **Workmanager** (background sync)
- **Riverpod** cho state management + DI
- **Dio** cho HTTP + interceptors
- **Freezed** cho immutable data classes

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│  Widget → ConsumerWidget → AsyncNotifier        │
│  (Riverpod watch/listen)                        │
└──────────────────┬──────────────────────────────┘
                   │ ref.watch(provider)
┌──────────────────▼──────────────────────────────┐
│                Domain Layer                      │
│  UseCase (pure Dart, no Flutter deps)           │
│  Repository Interface                           │
│  Entity (Freezed)                               │
└──────────────────┬──────────────────────────────┘
                   │ implement
┌──────────────────▼──────────────────────────────┐
│                Data Layer                        │
│  RepositoryImpl                                 │
│    ├── LocalDataSource (Drift/SQLite)           │
│    └── RemoteDataSource (Dio → API)             │
│  SyncService (Workmanager)                      │
└─────────────────────────────────────────────────┘
```

---

## Phần 1 — pubspec.yaml

```yaml
name: nihongo_app
environment:
  sdk: ">=3.3.0 <4.0.0"
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter

  # SQLite ORM — type-safe, có migration
  drift: ^2.18.0
  drift_flutter: ^0.2.0        # Flutter-specific drift setup
  sqlite3_flutter_libs: ^0.5.0 # native SQLite binaries

  # State management + DI
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # HTTP
  dio: ^5.4.3
  pretty_dio_logger: ^1.3.1

  # Data classes
  freezed_annotation: ^2.4.1
  json_annotation: ^4.9.0

  # Network monitoring
  connectivity_plus: ^6.0.3

  # Background sync
  workmanager: ^0.5.2

  # Secure storage (JWT token)
  flutter_secure_storage: ^9.2.2

  # Navigation
  go_router: ^14.2.0

  # Utils
  collection: ^1.18.0

dev_dependencies:
  drift_dev: ^2.18.0
  build_runner: ^2.4.9
  riverpod_generator: ^2.4.0
  freezed: ^2.5.2
  json_serializable: ^6.8.0
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.4
```

---

## Phần 2 — Domain Layer (pure Dart)

### `lib/domain/entity/vocabulary.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'vocabulary.freezed.dart';
part 'vocabulary.g.dart';

@freezed
class Vocabulary with _$Vocabulary {
  const factory Vocabulary({
    required int id,
    required int lessonNumber,
    required String kana,
    String? kanji,
    required String meaning,
    required int sortOrder,
    @Default(SyncStatus.synced) SyncStatus syncStatus,
  }) = _Vocabulary;

  factory Vocabulary.fromJson(Map<String, dynamic> json) =>
      _$VocabularyFromJson(json);
}

@freezed
class SrsCard with _$SrsCard {
  const factory SrsCard({
    required int id,
    required int vocabularyId,
    required double easeFactor,
    required int interval,
    required int repetitions,
    required DateTime nextReviewAt,
    @Default(false) bool mastered,
    @Default(SyncStatus.synced) SyncStatus syncStatus,
    required DateTime updatedAt,
  }) = _SrsCard;

  factory SrsCard.fromJson(Map<String, dynamic> json) =>
      _$SrsCardFromJson(json);
}

enum SyncStatus { synced, pending, conflict }
```

### `lib/domain/repository/vocabulary_repository.dart`

```dart
import '../entity/vocabulary.dart';

abstract interface class VocabularyRepository {
  Stream<List<Vocabulary>> watchVocabByLesson(int lessonNumber);
  Stream<List<SrsCard>> watchReviewQueue();
  Future<Result<void>> updateSrsCard(SrsCard card);
  Future<Result<void>> sync();
}

// Result type — không throw exception ra UI
sealed class Result<T> {
  const Result();
}

final class Success<T> extends Result<T> {
  const Success(this.value);
  final T value;
}

final class Failure<T> extends Result<T> {
  const Failure(this.error, {this.stackTrace});
  final Object error;
  final StackTrace? stackTrace;
}
```

### `lib/domain/usecase/get_review_queue_usecase.dart`

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../repository/vocabulary_repository.dart';
import '../entity/vocabulary.dart';

part 'get_review_queue_usecase.g.dart';

class GetReviewQueueUseCase {
  const GetReviewQueueUseCase(this._repo);
  final VocabularyRepository _repo;

  // Chỉ lấy cards đến hạn hôm nay
  Stream<List<SrsCard>> call() {
    return _repo.watchReviewQueue().map(
      (cards) => cards
          .where((c) => c.nextReviewAt.isBefore(DateTime.now()))
          .toList(),
    );
  }
}
```

---

## Phần 3 — Data Layer / Drift (SQLite)

### `lib/data/local/app_database.dart`

```dart
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'app_database.g.dart';

// ─── Tables ──────────────────────────────────────────────────────────────────

class VocabularyTable extends Table {
  @override
  String get tableName => 'vocabulary';

  IntColumn get id => integer()();
  IntColumn get lessonNumber => integer().named('lesson_number')();
  TextColumn get kana => text()();
  TextColumn get kanji => text().nullable()();
  TextColumn get meaning => text()();
  IntColumn get sortOrder => integer().named('sort_order')();
  TextColumn get syncStatus => text().named('sync_status').withDefault(const Constant('synced'))();
  IntColumn get updatedAt => integer().named('updated_at')();

  @override
  Set<Column> get primaryKey => {id};
}

class SrsCardTable extends Table {
  @override
  String get tableName => 'srs_card';

  IntColumn get id => integer()();
  IntColumn get vocabularyId => integer().named('vocabulary_id').references(VocabularyTable, #id)();
  RealColumn get easeFactor => real().named('ease_factor').withDefault(const Constant(2.5))();
  IntColumn get interval => integer().withDefault(const Constant(0))();
  IntColumn get repetitions => integer().withDefault(const Constant(0))();
  IntColumn get nextReviewAt => integer().named('next_review_at')();
  BoolColumn get mastered => boolean().withDefault(const Constant(false))();
  TextColumn get syncStatus => text().named('sync_status').withDefault(const Constant('synced'))();
  IntColumn get updatedAt => integer().named('updated_at')();

  @override
  Set<Column> get primaryKey => {id};
}

class SyncQueueTable extends Table {
  @override
  String get tableName => 'sync_queue';

  IntColumn get id => integer().autoIncrement()();
  TextColumn get operation => text()();    // "UPDATE_SRS", "CREATE_NOTE"
  IntColumn get entityId => integer().named('entity_id')();
  TextColumn get payload => text()();     // JSON
  IntColumn get retryCount => integer().named('retry_count').withDefault(const Constant(0))();
  IntColumn get createdAt => integer().named('created_at')();
}

// ─── Database ─────────────────────────────────────────────────────────────────

@DriftDatabase(tables: [VocabularyTable, SrsCardTable, SyncQueueTable])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (m) => m.createAll(),
    onUpgrade: (m, from, to) async {
      // Migration v1 → v2 ví dụ:
      // if (from < 2) {
      //   await m.addColumn(srsCardTable, srsCardTable.someNewColumn);
      // }
    },
  );
}

DatabaseConnection _openConnection() {
  return DatabaseConnection(driftDatabase(name: 'edu_app.db'));
}
```

### `lib/data/local/dao/srs_card_dao.dart`

```dart
import 'package:drift/drift.dart';
import '../app_database.dart';

part 'srs_card_dao.g.dart';

@DriftAccessor(tables: [SrsCardTable])
class SrsCardDao extends DatabaseAccessor<AppDatabase> with _$SrsCardDaoMixin {
  SrsCardDao(super.db);

  // Stream — tự emit khi data thay đổi
  Stream<List<SrsCardTableData>> watchReviewQueue({int limit = 20}) {
    final now = DateTime.now().millisecondsSinceEpoch;
    return (select(srsCardTable)
          ..where((t) => t.nextReviewAt.isSmallerOrEqualValue(now))
          ..orderBy([(t) => OrderingTerm.asc(t.nextReviewAt)])
          ..limit(limit))
        .watch();
  }

  Future<SrsCardTableData?> getByVocabId(int vocabId) {
    return (select(srsCardTable)
          ..where((t) => t.vocabularyId.equals(vocabId)))
        .getSingleOrNull();
  }

  Future<void> upsert(SrsCardTableCompanion card) {
    return into(srsCardTable).insertOnConflictUpdate(card);
  }

  Future<void> updateAfterReview({
    required int id,
    required double easeFactor,
    required int interval,
    required int repetitions,
    required int nextReviewAt,
    required bool mastered,
  }) {
    return (update(srsCardTable)..where((t) => t.id.equals(id))).write(
      SrsCardTableCompanion(
        easeFactor: Value(easeFactor),
        interval: Value(interval),
        repetitions: Value(repetitions),
        nextReviewAt: Value(nextReviewAt),
        mastered: Value(mastered),
        syncStatus: const Value('pending'),
        updatedAt: Value(DateTime.now().millisecondsSinceEpoch),
      ),
    );
  }

  Future<List<SrsCardTableData>> getPendingSync() {
    return (select(srsCardTable)
          ..where((t) => t.syncStatus.equals('pending')))
        .get();
  }

  Future<void> markSynced(List<int> ids) {
    return (update(srsCardTable)..where((t) => t.id.isIn(ids))).write(
      const SrsCardTableCompanion(syncStatus: Value('synced')),
    );
  }
}
```

---

## Phần 4 — Remote DataSource

### `lib/data/remote/vocabulary_api.dart`

```dart
import 'package:dio/dio.dart';

class VocabularyApi {
  VocabularyApi(this._dio);
  final Dio _dio;

  Future<List<Map<String, dynamic>>> fetchVocab() async {
    final res = await _dio.get('/vocabularies');
    return List<Map<String, dynamic>>.from(res.data['data']);
  }

  Future<List<Map<String, dynamic>>> fetchSrsCards() async {
    final res = await _dio.get('/srs/cards');
    return List<Map<String, dynamic>>.from(res.data['data']);
  }

  Future<void> updateSrsCard(Map<String, dynamic> card) async {
    await _dio.put('/srs/cards/${card['id']}', data: card);
  }
}
```

### `lib/data/remote/dio_factory.dart`

```dart
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:flutter/foundation.dart';
import '../local/token_store.dart';

Dio createDio(TokenStore tokenStore) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://10.0.2.2:3000/api', // localhost từ emulator
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  dio.interceptors.addAll([
    // Tự attach JWT token
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStore.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Token expired → refresh
        if (error.response?.statusCode == 401) {
          final refreshed = await tokenStore.refresh();
          if (refreshed != null) {
            error.requestOptions.headers['Authorization'] = 'Bearer $refreshed';
            final retryRes = await dio.fetch(error.requestOptions);
            return handler.resolve(retryRes);
          }
        }
        handler.next(error);
      },
    ),

    if (kDebugMode)
      PrettyDioLogger(
        requestHeader: false,
        requestBody: true,
        responseBody: true,
      ),
  ]);

  return dio;
}
```

---

## Phần 5 — Offline-First Repository

### `lib/data/repository/vocabulary_repository_impl.dart`

```dart
import 'dart:convert';
import '../../domain/repository/vocabulary_repository.dart';
import '../../domain/entity/vocabulary.dart';
import '../local/dao/vocabulary_dao.dart';
import '../local/dao/srs_card_dao.dart';
import '../local/dao/sync_queue_dao.dart';
import '../remote/vocabulary_api.dart';
import '../local/app_database.dart';
import '../../utils/network_monitor.dart';

class VocabularyRepositoryImpl implements VocabularyRepository {
  VocabularyRepositoryImpl({
    required this.vocabDao,
    required this.srsCardDao,
    required this.syncQueueDao,
    required this.api,
    required this.networkMonitor,
  });

  final VocabularyDao vocabDao;
  final SrsCardDao srsCardDao;
  final SyncQueueDao syncQueueDao;
  final VocabularyApi api;
  final NetworkMonitor networkMonitor;

  // ─── Read: luôn từ local DB ──────────────────────────────────────────────
  @override
  Stream<List<Vocabulary>> watchVocabByLesson(int lessonNumber) {
    return vocabDao
        .watchByLesson(lessonNumber)
        .map((rows) => rows.map(_toVocabDomain).toList());
  }

  @override
  Stream<List<SrsCard>> watchReviewQueue() {
    return srsCardDao
        .watchReviewQueue()
        .map((rows) => rows.map(_toSrsCardDomain).toList());
  }

  // ─── Write: local trước, queue sync ─────────────────────────────────────
  @override
  Future<Result<void>> updateSrsCard(SrsCard card) async {
    try {
      // 1. Update local ngay
      await srsCardDao.updateAfterReview(
        id: card.id,
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReviewAt: card.nextReviewAt.millisecondsSinceEpoch,
        mastered: card.mastered,
      );

      // 2. Enqueue sync
      await syncQueueDao.enqueue(
        operation: 'UPDATE_SRS',
        entityId: card.id,
        payload: jsonEncode(card.toJson()),
      );

      // 3. Nếu online → sync ngay
      if (await networkMonitor.isOnline()) {
        await _syncSrsCard(card);
      }

      return const Success(null);
    } catch (e, st) {
      return Failure(e, stackTrace: st);
    }
  }

  // ─── Sync từ server về local ─────────────────────────────────────────────
  @override
  Future<Result<void>> sync() async {
    try {
      // 1. Upload pending trước
      await _flushSyncQueue();

      // 2. Download vocab
      final remoteVocab = await api.fetchVocab();
      await vocabDao.upsertAll(remoteVocab.map(_toVocabEntity).toList());

      // 3. Download SRS cards — server-wins (trừ pending)
      final remoteCards = await api.fetchSrsCards();
      for (final remote in remoteCards) {
        final localCard = await srsCardDao.getByVocabId(remote['vocabularyId'] as int);
        if (localCard == null || localCard.syncStatus != 'pending') {
          await srsCardDao.upsert(_toSrsEntity(remote));
        }
        // Nếu local PENDING: giữ nguyên, conflict sẽ được resolve sau
      }

      return const Success(null);
    } catch (e, st) {
      return Failure(e, stackTrace: st);
    }
  }

  Future<void> _flushSyncQueue() async {
    final pending = await syncQueueDao.getPending();
    for (final item in pending) {
      try {
        if (item.operation == 'UPDATE_SRS') {
          final card = SrsCard.fromJson(
            jsonDecode(item.payload) as Map<String, dynamic>,
          );
          await api.updateSrsCard(card.toJson());
          await srsCardDao.markSynced([card.id]);
          await syncQueueDao.delete(item.id);
        }
      } catch (_) {
        await syncQueueDao.incrementRetry(item.id);
        if (item.retryCount >= 3) {
          await syncQueueDao.markFailed(item.id);
        }
      }
    }
  }

  Future<void> _syncSrsCard(SrsCard card) async {
    try {
      await api.updateSrsCard(card.toJson());
      await srsCardDao.markSynced([card.id]);
      await syncQueueDao.deleteByEntityId('UPDATE_SRS', card.id);
    } catch (_) {
      // Silent — WorkManager sẽ retry
    }
  }

  // ─── Mappers ─────────────────────────────────────────────────────────────
  Vocabulary _toVocabDomain(VocabularyTableData row) => Vocabulary(
        id: row.id,
        lessonNumber: row.lessonNumber,
        kana: row.kana,
        kanji: row.kanji,
        meaning: row.meaning,
        sortOrder: row.sortOrder,
        syncStatus: SyncStatus.values.byName(row.syncStatus),
      );

  SrsCard _toSrsCardDomain(SrsCardTableData row) => SrsCard(
        id: row.id,
        vocabularyId: row.vocabularyId,
        easeFactor: row.easeFactor,
        interval: row.interval,
        repetitions: row.repetitions,
        nextReviewAt: DateTime.fromMillisecondsSinceEpoch(row.nextReviewAt),
        mastered: row.mastered,
        syncStatus: SyncStatus.values.byName(row.syncStatus),
        updatedAt: DateTime.fromMillisecondsSinceEpoch(row.updatedAt),
      );

  VocabularyTableCompanion _toVocabEntity(Map<String, dynamic> json) =>
      VocabularyTableCompanion.insert(
        id: Value(json['id'] as int),
        lessonNumber: json['lessonNumber'] as int,
        kana: json['kana'] as String,
        kanji: Value(json['kanji'] as String?),
        meaning: json['meaning'] as String,
        sortOrder: json['sortOrder'] as int,
        syncStatus: const Value('synced'),
        updatedAt: DateTime.now().millisecondsSinceEpoch,
      );

  SrsCardTableCompanion _toSrsEntity(Map<String, dynamic> json) =>
      SrsCardTableCompanion.insert(
        id: Value(json['id'] as int),
        vocabularyId: json['vocabularyId'] as int,
        easeFactor: Value(json['easeFactor'] as double),
        interval: Value(json['interval'] as int),
        repetitions: Value(json['repetitions'] as int),
        nextReviewAt: DateTime.parse(json['nextReviewAt'] as String)
            .millisecondsSinceEpoch,
        mastered: Value(json['mastered'] as bool),
        syncStatus: const Value('synced'),
        updatedAt: DateTime.now().millisecondsSinceEpoch,
      );
}
```

---

## Phần 6 — Network Monitor

```dart
// lib/utils/network_monitor.dart
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'network_monitor.g.dart';

class NetworkMonitor {
  NetworkMonitor(this._connectivity);
  final Connectivity _connectivity;

  Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return result.any((r) => r != ConnectivityResult.none);
  }

  Stream<bool> get onlineStream => _connectivity.onConnectivityChanged.map(
        (results) => results.any((r) => r != ConnectivityResult.none),
      );
}

@riverpod
NetworkMonitor networkMonitor(NetworkMonitorRef ref) =>
    NetworkMonitor(Connectivity());

// StreamProvider — widget có thể watch online status
@riverpod
Stream<bool> isOnline(IsOnlineRef ref) {
  return ref.watch(networkMonitorProvider).onlineStream;
}
```

---

## Phần 7 — Background Sync (Workmanager)

```dart
// lib/data/sync/sync_service.dart
import 'package:workmanager/workmanager.dart';

const _syncTaskName = 'edu_sync';
const _syncTaskUniqueName = 'edu_sync_periodic';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) async {
    if (taskName == _syncTaskName) {
      return _runSync();
    }
    return Future.value(true);
  });
}

Future<bool> _runSync() async {
  try {
    // Khởi tạo DI thủ công vì đây là background isolate riêng
    final db = AppDatabase();
    final tokenStore = TokenStore();

    final token = await tokenStore.getAccessToken();
    if (token == null) return true; // chưa login → skip

    final dio = createDio(tokenStore);
    final repo = VocabularyRepositoryImpl(
      vocabDao: VocabularyDao(db),
      srsCardDao: SrsCardDao(db),
      syncQueueDao: SyncQueueDao(db),
      api: VocabularyApi(dio),
      networkMonitor: NetworkMonitor(Connectivity()),
    );

    final result = await repo.sync();
    return result is Success;
  } catch (_) {
    return false; // Workmanager sẽ retry
  }
}

class SyncService {
  static Future<void> initialize() async {
    await Workmanager().initialize(callbackDispatcher);
  }

  // Periodic sync mỗi 15 phút
  static Future<void> schedulePeriodic() async {
    await Workmanager().registerPeriodicTask(
      _syncTaskUniqueName,
      _syncTaskName,
      frequency: const Duration(minutes: 15),
      constraints: Constraints(networkType: NetworkType.connected),
      backoffPolicy: BackoffPolicy.exponential,
      backoffPolicyDelay: const Duration(minutes: 1),
      existingWorkPolicy: ExistingWorkPolicy.keep,
    );
  }

  // Sync ngay khi user mở app / có mạng
  static Future<void> syncNow() async {
    await Workmanager().registerOneOffTask(
      '$_syncTaskUniqueName-now',
      _syncTaskName,
      constraints: Constraints(networkType: NetworkType.connected),
      existingWorkPolicy: ExistingWorkPolicy.replace,
    );
  }
}
```

---

## Phần 8 — Riverpod Providers (DI + State)

```dart
// lib/providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'providers.g.dart';

// ─── Infrastructure ───────────────────────────────────────────────────────

@Riverpod(keepAlive: true)
AppDatabase appDatabase(AppDatabaseRef ref) => AppDatabase();

@Riverpod(keepAlive: true)
TokenStore tokenStore(TokenStoreRef ref) => TokenStore();

@Riverpod(keepAlive: true)
Dio dio(DioRef ref) => createDio(ref.watch(tokenStoreProvider));

// ─── DAOs ────────────────────────────────────────────────────────────────

@Riverpod(keepAlive: true)
VocabularyDao vocabDao(VocabDaoRef ref) =>
    VocabularyDao(ref.watch(appDatabaseProvider));

@Riverpod(keepAlive: true)
SrsCardDao srsCardDao(SrsCardDaoRef ref) =>
    SrsCardDao(ref.watch(appDatabaseProvider));

@Riverpod(keepAlive: true)
SyncQueueDao syncQueueDao(SyncQueueDaoRef ref) =>
    SyncQueueDao(ref.watch(appDatabaseProvider));

// ─── Repository ───────────────────────────────────────────────────────────

@Riverpod(keepAlive: true)
VocabularyRepository vocabRepo(VocabRepoRef ref) =>
    VocabularyRepositoryImpl(
      vocabDao: ref.watch(vocabDaoProvider),
      srsCardDao: ref.watch(srsCardDaoProvider),
      syncQueueDao: ref.watch(syncQueueDaoProvider),
      api: VocabularyApi(ref.watch(dioProvider)),
      networkMonitor: ref.watch(networkMonitorProvider),
    );

// ─── UseCases ─────────────────────────────────────────────────────────────

@riverpod
GetReviewQueueUseCase getReviewQueueUseCase(GetReviewQueueUseCaseRef ref) =>
    GetReviewQueueUseCase(ref.watch(vocabRepoProvider));

// ─── State (AsyncNotifier) ────────────────────────────────────────────────

@riverpod
class SrsNotifier extends _$SrsNotifier {
  @override
  Stream<List<SrsCard>> build() {
    // Tự dispose khi widget unmount, không leak
    return ref.watch(getReviewQueueUseCaseProvider).call();
  }

  Future<void> reviewCard(SrsCard card, int quality) async {
    final updated = SrsAlgorithm.calculateNextReview(card, quality);
    final result = await ref.read(vocabRepoProvider).updateSrsCard(updated);
    if (result is Failure) {
      // Stream sẽ tự rollback vì Room emit lại
    }
  }

  Future<void> syncNow() async {
    await ref.read(vocabRepoProvider).sync();
  }
}
```

---

## Phần 9 — UI (Flutter Widgets)

```dart
// lib/presentation/srs/srs_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SrsScreen extends ConsumerWidget {
  const SrsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cardsAsync = ref.watch(srsNotifierProvider);
    final isOnline = ref.watch(isOnlineProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ôn tập'),
        actions: [
          // Offline banner
          isOnline.when(
            data: (online) => online
                ? const SizedBox.shrink()
                : const _OfflineChip(),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: cardsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Lỗi: $e')),
        data: (cards) {
          if (cards.isEmpty) {
            return const _EmptyState();
          }
          return _SrsCardStack(cards: cards);
        },
      ),
    );
  }
}

class _OfflineChip extends StatelessWidget {
  const _OfflineChip();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Chip(
        avatar: const Icon(Icons.cloud_off, size: 16),
        label: const Text('Offline'),
        backgroundColor: Theme.of(context).colorScheme.errorContainer,
        labelStyle: TextStyle(
          color: Theme.of(context).colorScheme.onErrorContainer,
          fontSize: 12,
        ),
        padding: EdgeInsets.zero,
      ),
    );
  }
}

class _SrsCardStack extends ConsumerStatefulWidget {
  const _SrsCardStack({required this.cards});
  final List<SrsCard> cards;

  @override
  ConsumerState<_SrsCardStack> createState() => _SrsCardStackState();
}

class _SrsCardStackState extends ConsumerState<_SrsCardStack> {
  bool _showAnswer = false;

  @override
  Widget build(BuildContext context) {
    final card = widget.cards.first;

    return Column(
      children: [
        // Progress
        LinearProgressIndicator(
          value: 1 - widget.cards.length / (widget.cards.length + 1),
        ),

        // Card
        Expanded(
          child: Card(
            margin: const EdgeInsets.all(16),
            elevation: 4,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(card.kana, style: Theme.of(context).textTheme.displayMedium),
                  if (_showAnswer) ...[
                    const SizedBox(height: 16),
                    Text(
                      card.meaning,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),

        // Buttons
        Padding(
          padding: const EdgeInsets.all(16),
          child: _showAnswer
              ? Row(
                  children: [
                    for (final (label, quality) in [
                      ('Quên', 0),
                      ('Khó', 2),
                      ('OK', 3),
                      ('Dễ', 5),
                    ])
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: OutlinedButton(
                            onPressed: () {
                              ref
                                  .read(srsNotifierProvider.notifier)
                                  .reviewCard(card, quality);
                              setState(() => _showAnswer = false);
                            },
                            child: Text(label),
                          ),
                        ),
                      ),
                  ],
                )
              : SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => setState(() => _showAnswer = true),
                    child: const Text('Xem đáp án'),
                  ),
                ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
          SizedBox(height: 16),
          Text('Không có thẻ cần ôn hôm nay!'),
        ],
      ),
    );
  }
}
```

---

## Phần 10 — main.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data/sync/sync_service.dart';
import 'presentation/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Init background sync
  await SyncService.initialize();
  await SyncService.schedulePeriodic();

  runApp(
    const ProviderScope(  // Riverpod root
      child: EduApp(),
    ),
  );
}
```

---

## Phần 11 — SRS Algorithm

```dart
// lib/utils/srs_algorithm.dart
import '../domain/entity/vocabulary.dart';

class SrsAlgorithm {
  static SrsCard calculateNextReview(SrsCard card, int quality) {
    if (quality < 3) {
      return card.copyWith(
        interval: 0,
        repetitions: 0,
        nextReviewAt: DateTime.now(),
        syncStatus: SyncStatus.pending,
        updatedAt: DateTime.now(),
      );
    }

    final int interval;
    if (card.repetitions == 0) {
      interval = 1;
    } else if (card.repetitions == 1) {
      interval = 6;
    } else {
      interval = (card.interval * card.easeFactor).round();
    }

    final easeFactor = (card.easeFactor + 0.1 * (quality - 5))
        .clamp(1.3, double.infinity);

    return card.copyWith(
      interval: interval,
      repetitions: card.repetitions + 1,
      easeFactor: easeFactor,
      mastered: interval >= 21,
      nextReviewAt: DateTime.now().add(Duration(days: interval)),
      syncStatus: SyncStatus.pending,
      updatedAt: DateTime.now(),
    );
  }
}
```

---

## Phần 12 — Testing

```dart
// test/srs_algorithm_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:nihongo_app/utils/srs_algorithm.dart';

void main() {
  final baseCard = SrsCard(
    id: 1,
    vocabularyId: 1,
    easeFactor: 2.5,
    interval: 6,
    repetitions: 2,
    nextReviewAt: DateTime.now(),
    updatedAt: DateTime.now(),
  );

  group('SM-2 wrong answer (quality < 3)', () {
    test('reset interval to 0', () {
      final result = SrsAlgorithm.calculateNextReview(baseCard, 2);
      expect(result.interval, 0);
    });

    test('reset repetitions to 0', () {
      final result = SrsAlgorithm.calculateNextReview(baseCard, 0);
      expect(result.repetitions, 0);
    });
  });

  group('SM-2 correct answer (quality >= 3)', () {
    test('first repetition → interval = 1', () {
      final card = baseCard.copyWith(repetitions: 0, interval: 0);
      expect(SrsAlgorithm.calculateNextReview(card, 5).interval, 1);
    });

    test('second repetition → interval = 6', () {
      final card = baseCard.copyWith(repetitions: 1, interval: 1);
      expect(SrsAlgorithm.calculateNextReview(card, 5).interval, 6);
    });

    test('ease factor never drops below 1.3', () {
      final card = baseCard.copyWith(easeFactor: 1.3);
      final result = SrsAlgorithm.calculateNextReview(card, 3);
      expect(result.easeFactor, greaterThanOrEqualTo(1.3));
    });

    test('mark mastered when interval >= 21', () {
      final card = baseCard.copyWith(interval: 10, repetitions: 3);
      final result = SrsAlgorithm.calculateNextReview(card, 5);
      expect(result.mastered, true); // 10 * 2.5 = 25 >= 21
    });
  });
}
```

```dart
// test/vocabulary_repository_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockVocabularyApi extends Mock implements VocabularyApi {}
class MockNetworkMonitor extends Mock implements NetworkMonitor {}

void main() {
  late VocabularyRepositoryImpl repo;
  late MockVocabularyApi mockApi;
  late MockNetworkMonitor mockNetwork;
  late AppDatabase db; // real in-memory DB

  setUp(() {
    mockApi = MockVocabularyApi();
    mockNetwork = MockNetworkMonitor();

    // Drift in-memory database cho test
    db = AppDatabase.forTesting(NativeDatabase.memory());

    repo = VocabularyRepositoryImpl(
      vocabDao: VocabularyDao(db),
      srsCardDao: SrsCardDao(db),
      syncQueueDao: SyncQueueDao(db),
      api: mockApi,
      networkMonitor: mockNetwork,
    );
  });

  tearDown(() => db.close());

  test('updateSrsCard saves locally even when offline', () async {
    // Arrange
    when(() => mockNetwork.isOnline()).thenAnswer((_) async => false);

    final card = SrsCard(
      id: 1,
      vocabularyId: 1,
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReviewAt: DateTime.now().add(const Duration(days: 6)),
      updatedAt: DateTime.now(),
    );

    // Act
    final result = await repo.updateSrsCard(card);

    // Assert
    expect(result, isA<Success>());
    verifyNever(() => mockApi.updateSrsCard(any())); // Không gọi API khi offline

    final saved = await SrsCardDao(db).getByVocabId(1);
    expect(saved?.syncStatus, 'pending'); // Đánh dấu pending
  });

  test('sync flushes pending queue when online', () async {
    when(() => mockNetwork.isOnline()).thenAnswer((_) async => true);
    when(() => mockApi.fetchVocab()).thenAnswer((_) async => []);
    when(() => mockApi.fetchSrsCards()).thenAnswer((_) async => []);
    when(() => mockApi.updateSrsCard(any())).thenAnswer((_) async {});

    // Tạo pending record
    await SyncQueueDao(db).enqueue(
      operation: 'UPDATE_SRS',
      entityId: 1,
      payload: '{"id":1}',
    );

    await repo.sync();

    verify(() => mockApi.updateSrsCard(any())).called(1);
  });
}
```

---

## File structure

```
lib/
├── domain/
│   ├── entity/
│   │   ├── vocabulary.dart
│   │   ├── vocabulary.freezed.dart    ← generated
│   │   └── vocabulary.g.dart         ← generated
│   ├── repository/
│   │   └── vocabulary_repository.dart
│   └── usecase/
│       └── get_review_queue_usecase.dart
│
├── data/
│   ├── local/
│   │   ├── app_database.dart
│   │   ├── app_database.g.dart       ← generated (Drift)
│   │   ├── dao/
│   │   │   ├── vocabulary_dao.dart
│   │   │   ├── srs_card_dao.dart
│   │   │   └── sync_queue_dao.dart
│   │   └── token_store.dart
│   ├── remote/
│   │   ├── vocabulary_api.dart
│   │   └── dio_factory.dart
│   ├── repository/
│   │   └── vocabulary_repository_impl.dart
│   └── sync/
│       └── sync_service.dart
│
├── presentation/
│   ├── app.dart
│   ├── srs/
│   │   └── srs_screen.dart
│   └── vocab/
│       └── vocab_screen.dart
│
├── utils/
│   ├── network_monitor.dart
│   └── srs_algorithm.dart
│
├── providers.dart
├── providers.g.dart                  ← generated
└── main.dart
```

---

## Code generation

```bash
# Chạy 1 lần để generate Drift + Freezed + Riverpod
dart run build_runner build --delete-conflicting-outputs

# Watch mode khi dev
dart run build_runner watch --delete-conflicting-outputs
```

---

## So sánh Android vs Flutter

| | Android (Kotlin) | Flutter (Dart) |
|---|---|---|
| SQLite ORM | Room + KSP | Drift + build_runner |
| State | ViewModel + StateFlow | Riverpod AsyncNotifier |
| DI | Hilt | Riverpod (built-in) |
| HTTP | Retrofit + OkHttp | Dio |
| Background sync | WorkManager | Workmanager plugin |
| Network | ConnectivityManager | connectivity_plus |
| Data class | data class + copy() | Freezed |
| Reactive query | Flow<List<T>> | Stream<List<T>> |
| Navigation | Navigation Component | go_router |

---

## Nguyên tắc senior offline-first (áp dụng cho cả Android và Flutter)

```
1. Single source of truth → Drift/Room là nguồn duy nhất
2. Optimistic update     → ghi local trước, sync sau
3. Sync queue            → không mất data khi mất mạng
4. Conflict strategy     → quyết định trước khi code
5. Idempotent sync       → PUT /srs/:id, không phải POST
6. Exponential backoff   → retry 1/2/4 phút → FAILED
7. Migration rõ ràng     → không dùng destructive migration ở production
8. Background isolate    → Workmanager chạy trong isolate riêng
                           → phải khởi tạo lại DB, Dio thủ công
```
