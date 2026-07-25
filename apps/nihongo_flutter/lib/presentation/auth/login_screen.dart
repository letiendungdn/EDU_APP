import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/remote/keycloak_oidc.dart';
import '../../providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  bool _kcLoading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _afterLoginOk() async {
    await ref.read(pushServiceProvider).registerAfterLogin();
    ref.invalidate(isLoggedInProvider);
    if (!mounted) return;
    context.pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng nhập thành công')),
    );
  }

  Future<void> _login() async {
    setState(() => _loading = true);
    try {
      await ref.read(authApiProvider).login(
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
          );
      await _afterLoginOk();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đăng nhập thất bại: $e')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _loginKeycloak() async {
    setState(() => _kcLoading = true);
    try {
      final oidc = await KeycloakOidc().login();
      await ref.read(authApiProvider).loginWithOidc(
            accessToken: oidc.accessToken,
            idToken: oidc.idToken,
          );
      await _afterLoginOk();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Keycloak thất bại: $e')),
      );
    } finally {
      if (mounted) setState(() => _kcLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final busy = _loading || _kcLoading;
    return Scaffold(
      appBar: AppBar(title: const Text('Đăng nhập')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FilledButton(
              onPressed: busy ? null : _loginKeycloak,
              child: _kcLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Đăng nhập Keycloak'),
            ),
            const SizedBox(height: 16),
            const Text('Dev login (email / mật khẩu)', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            TextField(
              controller: _emailCtrl,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordCtrl,
              decoration: const InputDecoration(labelText: 'Mật khẩu'),
              obscureText: true,
              autofillHints: const [AutofillHints.password],
            ),
            const SizedBox(height: 24),
            FilledButton.tonal(
              onPressed: busy ? null : _login,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Đăng nhập email'),
            ),
          ],
        ),
      ),
    );
  }
}
