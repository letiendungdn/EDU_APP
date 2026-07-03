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
          const SizedBox(height: 24),
          _NavCard(
            icon: Icons.menu_book,
            title: 'Từ vựng',
            subtitle: 'Tải & học theo bài Minna',
            onTap: () => context.push('/vocab'),
          ),
          const SizedBox(height: 12),
          _NavCard(
            icon: Icons.style,
            title: 'Ôn tập SRS',
            subtitle: 'Flashcard spaced repetition',
            onTap: () => context.push('/srs'),
          ),
          const SizedBox(height: 12),
          _NavCard(
            icon: Icons.translate,
            title: 'Dịch camera',
            subtitle: 'Nhận chữ & dịch trực tiếp trên camera',
            onTap: () => context.push('/camera-translate'),
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
