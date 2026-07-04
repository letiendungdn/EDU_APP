import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'ai_tutor/ai_tutor_screen.dart';
import 'auth/login_screen.dart';
import 'camera/camera_translate_screen.dart';
import 'home/home_screen.dart';
import 'kanji_draw/kanji_draw_screen.dart';
import 'live/live_host_screen.dart';
import 'live/live_list_screen.dart';
import 'live/live_viewer_screen.dart';
import '../../data/remote/live_api.dart';
import 'pronunciation/pronunciation_screen.dart';
import 'srs/srs_screen.dart';
import 'vocab/vocab_screen.dart';

class NihongoApp extends ConsumerWidget {
  const NihongoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = _router;

    return MaterialApp.router(
      title: 'Nihongo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFEF4444),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFEF4444),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/vocab',
      builder: (context, state) => const VocabScreen(),
    ),
    GoRoute(
      path: '/srs',
      builder: (context, state) => const SrsScreen(),
    ),
    GoRoute(
      path: '/camera-translate',
      builder: (context, state) => const CameraTranslateScreen(),
    ),
    GoRoute(
      path: '/live',
      builder: (context, state) => const LiveListScreen(),
    ),
    GoRoute(
      path: '/live/viewer',
      builder: (context, state) {
        final join = state.extra as LiveJoinResponse;
        return LiveViewerScreen(join: join);
      },
    ),
    GoRoute(
      path: '/live/host',
      builder: (context, state) {
        final join = state.extra as LiveJoinResponse;
        return LiveHostScreen(join: join);
      },
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/ai-tutor',
      builder: (_, __) => const AiTutorScreen(),
    ),
    GoRoute(
      path: '/pronunciation',
      builder: (_, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return PronunciationScreen(
          kana: extra?['kana'] as String? ?? '',
          meaning: extra?['meaning'] as String? ?? '',
        );
      },
    ),
    GoRoute(
      path: '/kanji-draw',
      builder: (_, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return KanjiDrawScreen(
          kanji: extra?['kanji'] as String? ?? '日',
          kana: extra?['kana'] as String? ?? 'にち',
        );
      },
    ),
  ],
);
