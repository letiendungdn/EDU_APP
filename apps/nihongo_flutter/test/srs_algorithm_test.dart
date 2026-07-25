import 'package:flutter_test/flutter_test.dart';
import 'package:nihongo_app/domain/entity/srs_card.dart';
import 'package:nihongo_app/domain/entity/sync_status.dart';
import 'package:nihongo_app/utils/srs_algorithm.dart';

SrsCard _card({
  double easeFactor = 2.5,
  int interval = 0,
  int repetitions = 0,
  bool mastered = false,
}) {
  final now = DateTime.now();
  return SrsCard(
    id: 1,
    vocabularyId: 10,
    easeFactor: easeFactor,
    interval: interval,
    repetitions: repetitions,
    nextReviewAt: now,
    mastered: mastered,
    syncStatus: SyncStatus.synced,
    updatedAt: now,
  );
}

void main() {
  group('SrsAlgorithm.calculateNextReview', () {
    test('clamps quality below 0 as again', () {
      final next = SrsAlgorithm.calculateNextReview(_card(repetitions: 3, interval: 10), -2);
      expect(next.repetitions, 0);
      expect(next.interval, 1);
      expect(next.syncStatus, SyncStatus.pending);
    });

    test('quality < 3 resets repetitions and sets interval to 1', () {
      final next = SrsAlgorithm.calculateNextReview(
        _card(repetitions: 4, interval: 15, easeFactor: 2.5),
        2,
      );
      expect(next.repetitions, 0);
      expect(next.interval, 1);
      expect(next.mastered, isFalse);
      expect(next.syncStatus, SyncStatus.pending);
    });

    test('first successful review uses interval 1', () {
      final next = SrsAlgorithm.calculateNextReview(_card(), 4);
      expect(next.repetitions, 1);
      expect(next.interval, 1);
    });

    test('second successful review uses interval 6', () {
      final next = SrsAlgorithm.calculateNextReview(
        _card(repetitions: 1, interval: 1),
        4,
      );
      expect(next.repetitions, 2);
      expect(next.interval, 6);
    });

    test('later reviews multiply interval by ease factor', () {
      final next = SrsAlgorithm.calculateNextReview(
        _card(repetitions: 2, interval: 6, easeFactor: 2.5),
        4,
      );
      expect(next.repetitions, 3);
      expect(next.interval, 15); // round(6 * 2.5)
    });

    test('ease factor never drops below 1.3', () {
      final next = SrsAlgorithm.calculateNextReview(
        _card(easeFactor: 1.3),
        0,
      );
      expect(next.easeFactor, greaterThanOrEqualTo(1.3));
    });

    test('mastered when repetitions >= 5 and interval >= 21', () {
      final next = SrsAlgorithm.calculateNextReview(
        _card(repetitions: 4, interval: 21, easeFactor: 2.5),
        5,
      );
      expect(next.repetitions, 5);
      expect(next.interval, greaterThanOrEqualTo(21));
      expect(next.mastered, isTrue);
    });

    test('schedules nextReviewAt about interval days ahead', () {
      final before = DateTime.now();
      final next = SrsAlgorithm.calculateNextReview(_card(), 4);
      final after = DateTime.now();

      expect(
        next.nextReviewAt.isAfter(before.add(const Duration(hours: 20))),
        isTrue,
      );
      expect(
        next.nextReviewAt.isBefore(after.add(const Duration(days: 2))),
        isTrue,
      );
    });
  });
}
