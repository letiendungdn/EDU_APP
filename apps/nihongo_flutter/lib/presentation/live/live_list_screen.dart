import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/remote/live_api.dart';
import '../../providers.dart';

class LiveListScreen extends ConsumerStatefulWidget {
  const LiveListScreen({super.key});

  @override
  ConsumerState<LiveListScreen> createState() => _LiveListScreenState();
}

class _LiveListScreenState extends ConsumerState<LiveListScreen> {
  List<LiveSessionSummary> _sessions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ref.read(liveApiProvider).listLiveSessions();
      if (mounted) setState(() => _sessions = list);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _join(LiveSessionSummary session) async {
    try {
      final res = await ref.read(liveApiProvider).joinSession(session.id);
      if (!mounted) return;
      context.push(
        '/live/viewer',
        extra: res,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Không vào được phòng: $e')),
      );
    }
  }

  Future<void> _startHost() async {
    final title = await showDialog<String>(
      context: context,
      builder: (ctx) {
        final c = TextEditingController(text: 'Livestream Nihongo');
        return AlertDialog(
          title: const Text('Bắt đầu live'),
          content: TextField(
            controller: c,
            decoration: const InputDecoration(labelText: 'Tiêu đề'),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, c.text.trim()),
              child: const Text('Tạo phòng'),
            ),
          ],
        );
      },
    );
    if (title == null || title.isEmpty) return;

    try {
      final res = await ref.read(liveApiProvider).createSession(title);
      if (!mounted) return;
      context.push('/live/host', extra: res);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Cần đăng nhập coach + LiveKit: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Livestream')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _startHost,
        icon: const Icon(Icons.videocam),
        label: const Text('Phát live'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? ListView(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text(_error!, textAlign: TextAlign.center),
                      ),
                    ],
                  )
                : _sessions.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 120),
                          Center(child: Text('Chưa có phòng live')),
                        ],
                      )
                    : ListView.builder(
                        itemCount: _sessions.length,
                        itemBuilder: (context, i) {
                          final s = _sessions[i];
                          return ListTile(
                            leading: const Icon(Icons.live_tv, color: Colors.red),
                            title: Text(s.title),
                            subtitle: Text(s.coachName ?? 'Coach'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () => _join(s),
                          );
                        },
                      ),
      ),
    );
  }
}
