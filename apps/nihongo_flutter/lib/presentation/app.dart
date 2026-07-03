import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth/login_screen.dart';
import 'camera/camera_translate_screen.dart';
import 'home/home_screen.dart';
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
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
);
