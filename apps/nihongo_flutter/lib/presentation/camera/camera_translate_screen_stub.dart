import 'package:flutter/material.dart';

/// Web stub — ML Kit OCR không chạy trên Chrome.
class CameraTranslateScreen extends StatelessWidget {
  const CameraTranslateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dịch camera')),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Dịch camera (ML Kit) chỉ hỗ trợ Android/iOS.\n'
            'Hãy chạy app trên điện thoại hoặc emulator.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
