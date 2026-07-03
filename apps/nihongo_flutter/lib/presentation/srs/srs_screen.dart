import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/repository/result.dart';
import '../../providers.dart';
import '../../utils/srs_algorithm.dart';

class SrsScreen extends ConsumerStatefulWidget {
  const SrsScreen({super.key});

  @override
  ConsumerState<SrsScreen> createState() => _SrsScreenState();
}

class _SrsScreenState extends ConsumerState<SrsScreen> {
  bool _showAnswer = false;

  Future<void> _rate(int quality) async {
    final cards = ref.read(reviewQueueProvider).valueOrNull;
    if (cards == null || cards.isEmpty) return;

    final current = cards.first;
    final updated = SrsAlgorithm.calculateNextReview(current.card, quality);
    final result =
        await ref.read(vocabRepositoryProvider).updateSrsCard(updated);

    if (!mounted) return;
    if (result is Failure) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi lưu: ${result.error}')),
      );
    }

    setState(() => _showAnswer = false);
  }

  @override
  Widget build(BuildContext context) {
    final cardsAsync = ref.watch(reviewQueueProvider);
    final isOnline = ref.watch(isOnlineProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ôn tập SRS'),
        actions: [
          isOnline.when(
            data: (online) => online
                ? const SizedBox.shrink()
                : const Padding(
                    padding: EdgeInsets.only(right: 8),
                    child: Chip(
                      avatar: Icon(Icons.cloud_off, size: 16),
                      label: Text('Offline'),
                    ),
                  ),
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
            return const Center(
              child: Text(
                'Không có thẻ cần ôn.\nTải từ vựng trước nhé!',
                textAlign: TextAlign.center,
              ),
            );
          }

          final card = cards.first;
          return Column(
            children: [
              LinearProgressIndicator(
                value: 1 / (cards.length + 1),
              ),
              Expanded(
                child: Card(
                  margin: const EdgeInsets.all(16),
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            card.kanji != null && card.kanji!.isNotEmpty
                                ? card.kanji!
                                : card.kana,
                            style: Theme.of(context).textTheme.displayMedium,
                          ),
                          if (card.kanji != null && card.kanji!.isNotEmpty)
                            Text(
                              card.kana,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          if (_showAnswer) ...[
                            const SizedBox(height: 16),
                            Text(
                              card.meaning,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              card.romaji,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              if (!_showAnswer)
                FilledButton(
                  onPressed: () => setState(() => _showAnswer = true),
                  child: const Text('Xem đáp án'),
                )
              else
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _rate(1),
                          child: const Text('Khó'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => _rate(4),
                          child: const Text('Đúng'),
                        ),
                      ),
                    ],
                  ),
                ),
              Text('Còn ${cards.length} thẻ', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 8),
            ],
          );
        },
      ),
    );
  }
}
