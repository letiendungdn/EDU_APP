import 'dart:convert';

import 'package:drift/drift.dart';

import '../../domain/entity/srs_card.dart';
import '../../domain/entity/sync_status.dart';
import '../../domain/entity/vocabulary.dart';
import '../../domain/repository/result.dart';
import '../../domain/repository/vocabulary_repository.dart';
import '../local/app_database.dart';
import '../remote/vocabulary_api.dart';
import '../../utils/network_monitor.dart';

class VocabularyRepositoryImpl implements VocabularyRepository {
  VocabularyRepositoryImpl({
    required AppDatabase db,
    required VocabularyApi api,
    required NetworkMonitor networkMonitor,
    required Future<bool> Function() isAuthenticated,
  })  : _db = db,
        _api = api,
        _network = networkMonitor,
        _isAuthenticated = isAuthenticated;

  final AppDatabase _db;
  final VocabularyApi _api;
  final NetworkMonitor _network;
  final Future<bool> Function() _isAuthenticated;

  @override
  Stream<List<Vocabulary>> watchVocabByLesson(int lessonNumber) {
    return _db.watchVocabByLesson(lessonNumber).map(
          (rows) => rows.map(_toVocabDomain).toList(),
        );
  }

  @override
  Stream<List<ReviewCard>> watchReviewQueue() {
    return _db.watchDueReviewCards().map(
          (rows) => rows
              .map(
                (row) => ReviewCard(
                  card: _toSrsDomain(row.card),
                  kana: row.vocab.kana,
                  kanji: row.vocab.kanji,
                  meaning: row.vocab.meaning,
                  romaji: row.vocab.romaji,
                ),
              )
              .toList(),
        );
  }

  @override
  Future<Result<void>> updateSrsCard(SrsCard card) async {
    try {
      await _db.updateSrsAfterReview(
        id: card.id,
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReviewAt: card.nextReviewAt.millisecondsSinceEpoch,
        mastered: card.mastered,
      );

      await _db.enqueueSync(
        operation: 'UPDATE_SRS',
        entityId: card.id,
        payload: jsonEncode(card.toJson()),
      );

      if (await _network.isOnline() && await _isAuthenticated()) {
        await syncAllPending();
      }

      return const Success(null);
    } catch (e, st) {
      return Failure(e, stackTrace: st);
    }
  }

  @override
  Future<Result<void>> syncLesson(int lessonNumber) async {
    if (!await _network.isOnline()) {
      return const Failure('Không có mạng');
    }

    try {
      final remote = await _api.fetchAllVocabForLesson(lessonNumber);
      final companions = <VocabularyTableCompanion>[];

      for (var i = 0; i < remote.length; i++) {
        final json = remote[i];
        final id = json['id'] as int;
        companions.add(
          VocabularyTableCompanion.insert(
            id: Value(id),
            lessonNumber: lessonNumber,
            kana: json['kana'] as String,
            kanji: Value(json['kanji'] as String?),
            meaning: json['meaning'] as String,
            romaji: Value(json['romaji'] as String? ?? ''),
            sortOrder: i,
            syncStatus: const Value('synced'),
            updatedAt: DateTime.now().millisecondsSinceEpoch,
          ),
        );

        await _ensureSrsCard(id);
      }

      if (companions.isNotEmpty) {
        await _db.upsertVocabularies(companions);
      }

      if (await _isAuthenticated()) {
        await syncAllPending();
      }

      return const Success(null);
    } catch (e, st) {
      return Failure(e, stackTrace: st);
    }
  }

  @override
  Future<Result<void>> syncAllPending() async {
    if (!await _network.isOnline() || !await _isAuthenticated()) {
      return const Success(null);
    }

    try {
      final pending = await _db.getPendingSyncItems();
      final reviewItems = <Map<String, dynamic>>[];

      for (final item in pending) {
        if (item.operation != 'UPDATE_SRS') continue;
        try {
          final card = SrsCard.fromJson(
            jsonDecode(item.payload) as Map<String, dynamic>,
          );
          final vocabRow = await _db.getSrsByVocabId(card.vocabularyId);
          if (vocabRow == null) continue;

          final join = await (_db.select(_db.vocabularyTable)
                ..where((t) => t.id.equals(card.vocabularyId)))
              .getSingleOrNull();

          if (join == null) continue;

          reviewItems.add({
            'kana': join.kana,
            'kanji': join.kanji,
            'meaning': join.meaning,
            'lessonNumber': join.lessonNumber,
            'wrongCount': card.repetitions == 0 ? 1 : 0,
            'reviewStreak': card.repetitions,
            'mastered': card.mastered,
            'lastReviewedAt': card.updatedAt.toIso8601String(),
          });

          await _db.markSrsSynced([card.id]);
          await _db.deleteSyncItem(item.id);
        } catch (_) {
          await _db.incrementSyncRetry(item.id, item.retryCount);
        }
      }

      if (reviewItems.isNotEmpty) {
        await _api.syncReviewBank(reviewItems);
      }

      return const Success(null);
    } catch (e, st) {
      return Failure(e, stackTrace: st);
    }
  }

  Future<void> _ensureSrsCard(int vocabularyId) async {
    final existing = await _db.getSrsByVocabId(vocabularyId);
    if (existing != null) return;

    final now = DateTime.now().millisecondsSinceEpoch;
    await _db.upsertSrsCard(
      SrsCardTableCompanion.insert(
        id: Value(vocabularyId),
        vocabularyId: vocabularyId,
        nextReviewAt: now,
        updatedAt: now,
      ),
    );
  }

  Vocabulary _toVocabDomain(VocabularyTableData row) => Vocabulary(
        id: row.id,
        lessonNumber: row.lessonNumber,
        kana: row.kana,
        kanji: row.kanji,
        meaning: row.meaning,
        romaji: row.romaji,
        sortOrder: row.sortOrder,
        syncStatus: SyncStatusX.fromStorage(row.syncStatus),
      );

  SrsCard _toSrsDomain(SrsCardTableData row) => SrsCard(
        id: row.id,
        vocabularyId: row.vocabularyId,
        easeFactor: row.easeFactor,
        interval: row.interval,
        repetitions: row.repetitions,
        nextReviewAt: DateTime.fromMillisecondsSinceEpoch(row.nextReviewAt),
        mastered: row.mastered,
        syncStatus: SyncStatusX.fromStorage(row.syncStatus),
        updatedAt: DateTime.fromMillisecondsSinceEpoch(row.updatedAt),
      );
}
