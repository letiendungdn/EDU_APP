import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/remote/sentence_practice_api.dart';
import '../../providers.dart';

// ── Screen ────────────────────────────────────────────────────────────────────

class SentencePracticeScreen extends ConsumerStatefulWidget {
  const SentencePracticeScreen({super.key});

  @override
  ConsumerState<SentencePracticeScreen> createState() =>
      _SentencePracticeScreenState();
}

class _SentencePracticeScreenState
    extends ConsumerState<SentencePracticeScreen> {
  final _controller = TextEditingController();
  final _scrollKey = GlobalKey();
  bool _loading = false;
  String? _error;
  final List<_HistoryEntry> _history = [];

  static const _starters = [
    'わたしは まいにち にほんご を べんきょう します。',
    'きのう ともだち と えいが を みました。',
    'すみません、えき は どこ ですか？',
    'Dịch: Hôm nay trời đẹp nhỉ.',
    'Dịch: Tôi muốn đến Nhật Bản.',
  ];

  Future<void> _submit() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _loading) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = ref.read(sentencePracticeApiProvider);
      final feedback = await api.analyze(text);
      _controller.clear();
      setState(() {
        _history.insert(0, _HistoryEntry(sentence: text, feedback: feedback));
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Luyện câu AI'),
        actions: [
          if (_history.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Xóa lịch sử',
              onPressed: () => setState(() => _history.clear()),
            ),
        ],
      ),
      body: Column(
        children: [
          // ── Input area ───────────────────────────────────────────────────
          _InputCard(
            controller: _controller,
            loading: _loading,
            error: _error,
            onSubmit: _submit,
          ),

          // ── Content ──────────────────────────────────────────────────────
          Expanded(
            child: _history.isEmpty
                ? _StarterGrid(
                    starters: _starters,
                    onTap: (s) {
                      _controller.text = s;
                      _controller.selection = TextSelection.fromPosition(
                        TextPosition(offset: s.length),
                      );
                    },
                  )
                : ListView.builder(
                    key: _scrollKey,
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    itemCount: _history.length,
                    itemBuilder: (context, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _FeedbackCard(
                        entry: _history[i],
                        expanded: i == 0,
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

// ── Input card ────────────────────────────────────────────────────────────────

class _InputCard extends StatelessWidget {
  const _InputCard({
    required this.controller,
    required this.loading,
    required this.error,
    required this.onSubmit,
  });

  final TextEditingController controller;
  final bool loading;
  final String? error;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha:0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Nhập câu tiếng Nhật hoặc "Dịch: câu tiếng Việt"',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: scheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: controller,
            enabled: !loading,
            maxLines: 3,
            minLines: 1,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => onSubmit(),
            style: const TextStyle(fontSize: 17),
            decoration: const InputDecoration(
              hintText: '例: わたしは がくせい です。',
            ),
          ),
          if (error != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: scheme.errorContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                error!,
                style: TextStyle(color: scheme.onErrorContainer, fontSize: 13),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  loading ? '🤖 Đang phân tích…' : 'Ctrl+Enter để gửi',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: scheme.onSurfaceVariant,
                      ),
                ),
              ),
              FilledButton.icon(
                onPressed: loading ? null : onSubmit,
                icon: loading
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: scheme.onPrimary,
                        ),
                      )
                    : const Icon(Icons.auto_awesome, size: 18),
                label: Text(loading ? 'Đang xử lý…' : 'Phân tích'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Starter grid ──────────────────────────────────────────────────────────────

class _StarterGrid extends StatelessWidget {
  const _StarterGrid({required this.starters, required this.onTap});

  final List<String> starters;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'THỬ NGAY',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: scheme.onSurfaceVariant,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: starters
                .map(
                  (s) => ActionChip(
                    label: Text(s, style: const TextStyle(fontSize: 13)),
                    onPressed: () => onTap(s),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 32),
          Center(
            child: Column(
              children: [
                Icon(Icons.edit_note_rounded,
                    size: 48, color: scheme.onSurfaceVariant.withValues(alpha:0.35)),
                const SizedBox(height: 12),
                Text(
                  'Viết một câu tiếng Nhật\nAI sẽ sửa lỗi và giải thích ngữ pháp',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: scheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Feedback card ─────────────────────────────────────────────────────────────

class _HistoryEntry {
  const _HistoryEntry({required this.sentence, required this.feedback});
  final String sentence;
  final SentenceFeedback feedback;
}

class _FeedbackCard extends StatefulWidget {
  const _FeedbackCard({required this.entry, this.expanded = false});
  final _HistoryEntry entry;
  final bool expanded;

  @override
  State<_FeedbackCard> createState() => _FeedbackCardState();
}

class _FeedbackCardState extends State<_FeedbackCard> {
  late bool _open;

  @override
  void initState() {
    super.initState();
    _open = widget.expanded;
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final f = widget.entry.feedback;
    final hasCorrection = f.corrected.isNotEmpty;

    return Card(
      child: InkWell(
        onTap: () => setState(() => _open = !_open),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      widget.entry.sentence,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _Badge(
                    label: hasCorrection ? '修正あり' : '✓ 正しい',
                    color: hasCorrection
                        ? scheme.tertiary
                        : scheme.primary,
                  ),
                  const SizedBox(width: 6),
                  Icon(
                    _open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    size: 20,
                    color: scheme.onSurfaceVariant,
                  ),
                ],
              ),

              // Expanded body
              if (_open) ...[
                const SizedBox(height: 16),
                const Divider(height: 1),
                const SizedBox(height: 16),

                if (hasCorrection) ...[
                  _Section(
                    label: 'CÂU ĐÃ SỬA',
                    color: scheme.tertiary,
                    child: Text(
                      f.corrected,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: scheme.tertiary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                if (f.reading.isNotEmpty) ...[
                  _Section(
                    label: 'PHIÊN ÂM',
                    child: Text(f.reading,
                        style: TextStyle(color: scheme.onSurfaceVariant)),
                  ),
                  const SizedBox(height: 12),
                ],

                _Section(
                  label: 'NGHĨA',
                  child: Text(
                    f.meaning,
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(height: 12),

                _Section(
                  label: 'GIẢI THÍCH',
                  child: Text(
                    f.explanation,
                    style: TextStyle(
                        color: scheme.onSurfaceVariant, height: 1.6),
                  ),
                ),

                if (f.examples.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _Section(
                    label: 'VÍ DỤ',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: f.examples
                          .map(
                            (ex) => Container(
                              width: double.infinity,
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: scheme.surfaceContainerLow,
                                borderRadius: BorderRadius.circular(8),
                                border: Border(
                                  left: BorderSide(
                                      color: scheme.primary, width: 3),
                                ),
                              ),
                              child: Text(ex, style: const TextStyle(fontSize: 14)),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.label, required this.child, this.color});
  final String label;
  final Widget child;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
            color: color ?? scheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 4),
        child,
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha:0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha:0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
