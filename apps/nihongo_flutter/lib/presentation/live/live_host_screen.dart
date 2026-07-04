import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart';

import '../../data/remote/live_api.dart';
import '../../providers.dart';

class LiveHostScreen extends ConsumerStatefulWidget {
  const LiveHostScreen({super.key, required this.join});

  final LiveJoinResponse join;

  @override
  ConsumerState<LiveHostScreen> createState() => _LiveHostScreenState();
}

class _LiveHostScreenState extends ConsumerState<LiveHostScreen> {
  Room? _room;
  LocalVideoTrack? _localVideo;
  bool _connecting = true;
  bool _micOn = true;
  bool _cameraOn = true;
  int _viewerCount = 0;

  @override
  void initState() {
    super.initState();
    _startStream();
  }

  Future<void> _startStream() async {
    final room = Room();
    room.addListener(() {
      if (mounted) {
        setState(() => _viewerCount = room.remoteParticipants.length);
      }
    });

    try {
      await room.connect(widget.join.wsUrl, widget.join.token);

      _localVideo = await LocalVideoTrack.createCameraTrack(
        const CameraCaptureOptions(
          cameraPosition: CameraPosition.front,
          params: VideoParametersPresets.h720_169,
        ),
      );

      await room.localParticipant?.publishVideoTrack(_localVideo!);
      await room.localParticipant?.setMicrophoneEnabled(true);

      setState(() {
        _room = room;
        _connecting = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không phát live được: $e')),
        );
        context.pop();
      }
    }
  }

  Future<void> _endStream() async {
    try {
      await ref.read(liveApiProvider).endSession(widget.join.sessionId);
    } catch (_) {}
    await _localVideo?.stop();
    await _room?.disconnect();
    if (mounted) context.pop();
  }

  @override
  void dispose() {
    _localVideo?.stop();
    _room?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_connecting) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            if (_localVideo != null)
              SizedBox.expand(child: VideoTrackRenderer(_localVideo!)),
            Positioned(
              top: 8,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    color: Colors.red,
                    child: const Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.visibility, color: Colors.white, size: 16),
                  Text(' $_viewerCount', style: const TextStyle(color: Colors.white)),
                  const Spacer(),
                  TextButton(
                    onPressed: _endStream,
                    style: TextButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text('Kết thúc', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 24,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _ControlButton(
                    icon: _micOn ? Icons.mic : Icons.mic_off,
                    onTap: () async {
                      await _room?.localParticipant?.setMicrophoneEnabled(!_micOn);
                      setState(() => _micOn = !_micOn);
                    },
                  ),
                  const SizedBox(width: 16),
                  _ControlButton(
                    icon: _cameraOn ? Icons.videocam : Icons.videocam_off,
                    onTap: () async {
                      await _room?.localParticipant?.setCameraEnabled(!_cameraOn);
                      setState(() => _cameraOn = !_cameraOn);
                    },
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

class _ControlButton extends StatelessWidget {
  const _ControlButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: Colors.white24,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Icon(icon, color: Colors.white, size: 28),
      ),
    );
  }
}
