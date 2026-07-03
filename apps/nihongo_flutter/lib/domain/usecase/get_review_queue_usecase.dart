import '../entity/srs_card.dart';
import '../repository/vocabulary_repository.dart';

class GetReviewQueueUseCase {
  const GetReviewQueueUseCase(this._repo);
  final VocabularyRepository _repo;

  Stream<List<ReviewCard>> call() {
    final now = DateTime.now();
    return _repo.watchReviewQueue().map(
          (cards) => cards
              .where((c) => !c.card.nextReviewAt.isAfter(now))
              .toList(),
        );
  }
}
