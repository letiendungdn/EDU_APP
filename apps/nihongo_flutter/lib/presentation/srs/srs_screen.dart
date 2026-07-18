import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entity/srs_card.dart';
import '../../domain/repository/result.dart';
import '../../providers.dart';
import '../../utils/srs_algorithm.dart';
import '../../utils/tts_service.dart';

// Rating: quality 1=Again 2=Hard 3=Good 4=Easy (SM-2 mapped)
const _ratings = [
  _Rating(quality: 1, label: 'Lại',  emoji: '🔁', color: Color(0xFFEF4444)),
  _Rating(quality: 2, label: 'Khó',  emoji: '💪', color: Color(0xFFF97316)),
  _Rating(quality: 3, label: 'Ổn',   emoji: '✅', color: Color(0xFF22C55E)),
  _Rating(quality: 4, label: 'Dễ',   emoji: '⚡', color: Color(0xFF3B82F6)),
];

class _Rating {
  const _Rating({
    required this.quality,
    required this.label,
    required this.emoji,
    required this.color,
  });
  final int quality;
  final String label;
  final String emoji;
  final Color color;
}

// ── Screen ────────────────────────────────────────────────────────────────────

class SrsScreen extends ConsumerStatefulWidget {
  const SrsScreen({super.key});

  @override
  ConsumerState<SrsScreen> createState() => _SrsScreenState();
}

class _SrsScreenState extends ConsumerState<SrsScreen> {
  bool _showAnswer = false;
  bool _speaking = false;
  bool _submitting = false;
  int _sessionCorrect = 0;
  int _sessionTotal = 0;

  // _done is derived from the stream: cards.isEmpty && _sessionTotal > 0
  // No local _done flag — avoids race between stream rebuild and local state.

  Future<void> _rate(int quality, List<ReviewCard> cards) async {
    if (_submitting || cards.isEmpty) return;
    setState(() => _submitting = true);

    final current = cards.first;
    final updated = SrsAlgorithm.calculateNextReview(current.card, quality);
    final result = await ref.read(vocabRepositoryProvider).updateSrsCard(updated);

    if (!mounted) return;

    if (result is Failure) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi lưu: ${result.error}')),
      );
    } else {
      if (quality >= 3) _sessionCorrect++;
      _sessionTotal++;
    }

    // Stream từ watchDueReviewCards() tự emit list mới sau khi DB update.
    // Chỉ cần reset UI state; done screen hiện khi stream emit [].
    setState(() {
      _showAnswer = false;
      _submitting = false;
    });
  }

  Future<void> _speak(String text) async {
    setState(() => _speaking = true);
    await TtsService.instance.speak(text);
    if (mounted) setState(() => _speaking = false);
  }

  void _restart() {
    setState(() {
      _showAnswer = false;
      _sessionCorrect = 0;
      _sessionTotal = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final cardsAsync = ref.watch(reviewQueueProvider);
    final isOnline = ref.watch(isOnlineProvider);
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ôn tập SRS'),
        actions: [
          isOnline.when(
            data: (online) => online
                ? const SizedBox.shrink()
                : Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Chip(
                      avatar: const Icon(Icons.cloud_off, size: 16),
                      label: const Text('Offline'),
                      backgroundColor: scheme.errorContainer,
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
            if (_sessionTotal == 0) {
              return _EmptyView();
            }
            return _DoneView(
              correct: _sessionCorrect,
              total: _sessionTotal,
              onRestart: _restart,
            );
          }

          final card = cards.first;
          final displayText =
              (card.kanji != null && card.kanji!.isNotEmpty) ? card.kanji! : card.kana;

          return Column(
            children: [
              // Progress bar
              _ProgressBar(
                current: _sessionTotal,
                total: _sessionTotal + cards.length,
                remaining: cards.length,
              ),

              // Flashcard
              Expanded(
                child: GestureDetector(
                  onTap: !_showAnswer ? () => setState(() => _showAnswer = true) : null,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: _FlashCard(
                      displayText: displayText,
                      kana: card.kana,
                      meaning: card.meaning,
                      romaji: card.romaji,
                      showAnswer: _showAnswer,
                      speaking: _speaking,
                      onSpeak: () => _speak(card.kana),
                      onPronounce: () => context.push(
                        '/pronunciation',
                        extra: {'kana': card.kana, 'meaning': card.meaning},
                      ),
                    ),
                  ),
                ),
              ),

              // Buttons
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: !_showAnswer
                    ? _ShowAnswerBtn(
                        key: const ValueKey('show'),
                        onTap: () => setState(() => _showAnswer = true),
                      )
                    : _RatingRow(
                        key: const ValueKey('rate'),
                        submitting: _submitting,
                        onRate: (q) => _rate(q, cards),
                      ),
              ),

              Text(
                'Còn ${cards.length} thẻ',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: scheme.onSurfaceVariant),
              ),
              const SizedBox(height: 12),
            ],
          );
        },
      ),
    );
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────────

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({
    required this.current,
    required this.total,
    required this.remaining,
  });
  final int current, total, remaining;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final pct = total > 0 ? current / total : 0.0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: pct,
                minHeight: 6,
                backgroundColor: scheme.outlineVariant,
                valueColor: AlwaysStoppedAnimation(scheme.primary),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '$current/$total',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: scheme.onSurfaceVariant,
                  fontVariations: const [FontVariation('wght', 600)],
                ),
          ),
        ],
      ),
    );
  }
}

// ── Flashcard ─────────────────────────────────────────────────────────────────

class _FlashCard extends StatelessWidget {
  const _FlashCard({
    required this.displayText,
    required this.kana,
    required this.meaning,
    required this.romaji,
    required this.showAnswer,
    required this.speaking,
    required this.onSpeak,
    required this.onPronounce,
  });

  final String displayText, kana, meaning, romaji;
  final bool showAnswer, speaking;
  final VoidCallback onSpeak, onPronounce;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Card(
      child: SizedBox(
        width: double.infinity,
        child: Stack(
          children: [
            // Main content
            Center(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 56, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Japanese word
                    Text(
                      displayText,
                      style: Theme.of(context).textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            letterSpacing: -1,
                          ),
                      textAlign: TextAlign.center,
                    ),

                    if (displayText != kana) ...[
                      const SizedBox(height: 6),
                      Text(
                        kana,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: scheme.primary,
                            ),
                      ),
                    ],

                    // Answer
                    if (showAnswer) ...[
                      const SizedBox(height: 20),
                      Divider(
                          color: scheme.outlineVariant,
                          indent: 32,
                          endIndent: 32),
                      const SizedBox(height: 20),
                      Text(
                        meaning,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w700),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        romaji,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: scheme.onSurfaceVariant,
                            ),
                      ),
                    ] else ...[
                      const SizedBox(height: 28),
                      Text(
                        'Nhấn để xem nghĩa',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: scheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Audio + pronunciation buttons (top-right)
            Positioned(
              top: 12,
              right: 12,
              child: Row(
                children: [
                  IconButton.outlined(
                    onPressed: onPronounce,
                    icon: const Icon(Icons.mic, size: 18),
                    tooltip: 'Luyện phát âm',
                    style: IconButton.styleFrom(
                      minimumSize: const Size(36, 36),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton.filled(
                    onPressed: speaking ? null : onSpeak,
                    icon: speaking
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: scheme.onPrimary,
                            ),
                          )
                        : const Icon(Icons.volume_up, size: 18),
                    tooltip: 'Nghe phát âm',
                    style: IconButton.styleFrom(
                      minimumSize: const Size(36, 36),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Show-answer button ────────────────────────────────────────────────────────

class _ShowAnswerBtn extends StatelessWidget {
  const _ShowAnswerBtn({super.key, required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: SizedBox(
        width: double.infinity,
        child: FilledButton(
          onPressed: onTap,
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          child: const Text('Xem đáp án', style: TextStyle(fontSize: 16)),
        ),
      ),
    );
  }
}

// ── Rating row ────────────────────────────────────────────────────────────────

class _RatingRow extends StatelessWidget {
  const _RatingRow({super.key, required this.submitting, required this.onRate});
  final bool submitting;
  final ValueChanged<int> onRate;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: _ratings.map((r) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _RatingBtn(
                rating: r,
                submitting: submitting,
                onTap: () => onRate(r.quality),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _RatingBtn extends StatelessWidget {
  const _RatingBtn({
    required this.rating,
    required this.submitting,
    required this.onTap,
  });
  final _Rating rating;
  final bool submitting;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: rating.color,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: submitting ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Opacity(
          opacity: submitting ? 0.5 : 1.0,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(rating.emoji, style: const TextStyle(fontSize: 18)),
                const SizedBox(height: 2),
                Text(
                  rating.label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Done screen ───────────────────────────────────────────────────────────────

class _DoneView extends StatelessWidget {
  const _DoneView({
    required this.correct,
    required this.total,
    required this.onRestart,
  });
  final int correct, total;
  final VoidCallback onRestart;

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? (correct / total * 100).round() : 0;
    final emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚';
    final scheme = Theme.of(context).colorScheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 56)),
            const SizedBox(height: 16),
            Text(
              'Xong phiên ôn!',
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              '$correct/$total đúng — $pct%',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: onRestart,
              icon: const Icon(Icons.refresh),
              label: const Text('Ôn tiếp'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                    horizontal: 32, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty (no cards due) ──────────────────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 16),
            Text(
              'Không có thẻ nào cần ôn hôm nay!',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Quay lại vào ngày mai để tiếp tục.',
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: scheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
