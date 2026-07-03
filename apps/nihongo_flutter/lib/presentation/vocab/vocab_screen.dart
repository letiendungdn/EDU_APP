import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/repository/result.dart';
import '../../providers.dart';

class VocabScreen extends ConsumerStatefulWidget {
  const VocabScreen({super.key});

  @override
  ConsumerState<VocabScreen> createState() => _VocabScreenState();
}

class _VocabScreenState extends ConsumerState<VocabScreen> {
  bool _syncing = false;

  Future<void> _syncLesson() async {
    setState(() => _syncing = true);
    final lesson = ref.read(selectedLessonProvider);
    final result =
        await ref.read(vocabRepositoryProvider).syncLesson(lesson);
    if (!mounted) return;
    setState(() => _syncing = false);

    final message = switch (result) {
      Success() => 'Đã tải bài $lesson',
      Failure(:final error) => 'Lỗi: $error',
    };

    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final lesson = ref.watch(selectedLessonProvider);
    final vocabAsync = ref.watch(vocabByLessonProvider(lesson));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Từ vựng'),
        actions: [
          IconButton(
            onPressed: _syncing ? null : _syncLesson,
            icon: _syncing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.cloud_download),
            tooltip: 'Tải từ server',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text('Bài'),
                const SizedBox(width: 12),
                DropdownButton<int>(
                  value: lesson,
                  items: List.generate(
                    25,
                    (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1}')),
                  ),
                  onChanged: (v) {
                    if (v != null) {
                      ref.read(selectedLessonProvider.notifier).state = v;
                    }
                  },
                ),
                const Spacer(),
                Text('${vocabAsync.valueOrNull?.length ?? 0} từ'),
              ],
            ),
          ),
          Expanded(
            child: vocabAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Lỗi: $e')),
              data: (vocabList) {
                if (vocabList.isEmpty) {
                  return Center(
                    child: Text(
                      'Chưa có dữ liệu.\nBấm ☁ để tải bài $lesson (cần mạng).',
                      textAlign: TextAlign.center,
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: vocabList.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final v = vocabList[index];
                    return ListTile(
                      title: Text(
                        v.kanji != null && v.kanji!.isNotEmpty
                            ? '${v.kanji}（${v.kana}）'
                            : v.kana,
                        style: const TextStyle(fontSize: 18),
                      ),
                      subtitle: Text('${v.meaning} · ${v.romaji}'),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
