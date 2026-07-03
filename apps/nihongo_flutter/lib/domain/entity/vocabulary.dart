import 'sync_status.dart';

class Vocabulary {
  const Vocabulary({
    required this.id,
    required this.lessonNumber,
    required this.kana,
    this.kanji,
    required this.meaning,
    required this.romaji,
    required this.sortOrder,
    this.syncStatus = SyncStatus.synced,
  });

  final int id;
  final int lessonNumber;
  final String kana;
  final String? kanji;
  final String meaning;
  final String romaji;
  final int sortOrder;
  final SyncStatus syncStatus;

  Vocabulary copyWith({
    SyncStatus? syncStatus,
  }) {
    return Vocabulary(
      id: id,
      lessonNumber: lessonNumber,
      kana: kana,
      kanji: kanji,
      meaning: meaning,
      romaji: romaji,
      sortOrder: sortOrder,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}
