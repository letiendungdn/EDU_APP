import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nihongo — EDU APP'),
        actions: [
          isOnline.when(
            data: (online) => Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Chip(
                avatar: Icon(
                  online ? Icons.cloud_done : Icons.cloud_off,
                  size: 16,
                ),
                label: Text(online ? 'Online' : 'Offline'),
              ),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Offline-first — đọc từ SQLite, sync khi có mạng.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          _SectionLabel('Học tập'),
          _NavCard(
            icon: Icons.menu_book,
            title: 'Từ vựng',
            subtitle: 'Tải & học theo bài Minna — nghe phát âm',
            onTap: () => context.push('/vocab'),
          ),
          _NavCard(
            icon: Icons.style,
            title: 'Ôn tập SRS',
            subtitle: 'Flashcard spaced repetition + TTS',
            onTap: () => context.push('/srs'),
          ),
          const SizedBox(height: 12),
          _SectionLabel('Luyện tập'),
          _NavCard(
            icon: Icons.translate,
            title: 'Dịch camera',
            subtitle: 'Nhận chữ & dịch trực tiếp — cache offline',
            onTap: () => context.push('/camera-translate'),
          ),
          _NavCard(
            icon: Icons.mic,
            title: 'Luyện phát âm',
            subtitle: 'Nói tiếng Nhật — nhận xét điểm số',
            onTap: () => context.push('/pronunciation',
                extra: {'kana': 'おはようございます', 'meaning': 'Chào buổi sáng'}),
          ),
          _NavCard(
            icon: Icons.draw,
            title: 'Vẽ Kanji',
            subtitle: 'Luyện viết tay trên màn hình',
            onTap: () => context.push('/kanji-draw',
                extra: {'kanji': '行', 'kana': 'いく'}),
          ),
          const SizedBox(height: 12),
          _SectionLabel('AI & Livestream'),
          _NavCard(
            icon: Icons.smart_toy_outlined,
            title: 'AI Tutor',
            subtitle: 'Hỏi ngữ pháp, từ vựng — Gemini trả lời',
            onTap: () => context.push('/ai-tutor'),
          ),
          _NavCard(
            icon: Icons.live_tv,
            title: 'Livestream',
            subtitle: 'Xem coach dạy trực tiếp',
            onTap: () => context.push('/live'),
          ),
          const SizedBox(height: 12),
          _NavCard(
            icon: Icons.login,
            title: 'Đăng nhập',
            subtitle: 'Sync tiến độ lên server',
            onTap: () => context.push('/login'),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8, top: 4),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _NavCard extends StatelessWidget {
  const _NavCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
