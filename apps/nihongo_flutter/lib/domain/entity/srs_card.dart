import 'sync_status.dart';

class SrsCard {
  const SrsCard({
    required this.id,
    required this.vocabularyId,
    required this.easeFactor,
    required this.interval,
    required this.repetitions,
    required this.nextReviewAt,
    this.mastered = false,
    this.syncStatus = SyncStatus.synced,
    required this.updatedAt,
  });

  final int id;
  final int vocabularyId;
  final double easeFactor;
  final int interval;
  final int repetitions;
  final DateTime nextReviewAt;
  final bool mastered;
  final SyncStatus syncStatus;
  final DateTime updatedAt;

  SrsCard copyWith({
    double? easeFactor,
    int? interval,
    int? repetitions,
    DateTime? nextReviewAt,
    bool? mastered,
    SyncStatus? syncStatus,
    DateTime? updatedAt,
  }) {
    return SrsCard(
      id: id,
      vocabularyId: vocabularyId,
      easeFactor: easeFactor ?? this.easeFactor,
      interval: interval ?? this.interval,
      repetitions: repetitions ?? this.repetitions,
      nextReviewAt: nextReviewAt ?? this.nextReviewAt,
      mastered: mastered ?? this.mastered,
      syncStatus: syncStatus ?? this.syncStatus,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'vocabularyId': vocabularyId,
        'easeFactor': easeFactor,
        'interval': interval,
        'repetitions': repetitions,
        'nextReviewAt': nextReviewAt.toIso8601String(),
        'mastered': mastered,
        'syncStatus': syncStatus.name,
        'updatedAt': updatedAt.toIso8601String(),
      };

  factory SrsCard.fromJson(Map<String, dynamic> json) {
    return SrsCard(
      id: json['id'] as int,
      vocabularyId: json['vocabularyId'] as int,
      easeFactor: (json['easeFactor'] as num).toDouble(),
      interval: json['interval'] as int,
      repetitions: json['repetitions'] as int,
      nextReviewAt: DateTime.parse(json['nextReviewAt'] as String),
      mastered: json['mastered'] as bool? ?? false,
      syncStatus: SyncStatusX.fromStorage(json['syncStatus'] as String? ?? 'synced'),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

class ReviewCard {
  const ReviewCard({
    required this.card,
    required this.kana,
    this.kanji,
    required this.meaning,
    required this.romaji,
  });

  final SrsCard card;
  final String kana;
  final String? kanji;
  final String meaning;
  final String romaji;
}
