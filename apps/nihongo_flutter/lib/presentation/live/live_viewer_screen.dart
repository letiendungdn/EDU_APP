import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:livekit_client/livekit_client.dart';

import '../../data/remote/live_api.dart';

class LiveViewerScreen extends ConsumerStatefulWidget {
  const LiveViewerScreen({super.key, required this.join});

  final LiveJoinResponse join;

  @override
  ConsumerState<LiveViewerScreen> createState() => _LiveViewerScreenState();
}

class _LiveViewerScreenState extends ConsumerState<LiveViewerScreen> {
  Room? _room;
  EventsListener? _listener;
  VideoTrack? _hostVideo;
  bool _connecting = true;
  bool _audioMuted = false;
  final _messages = <_ChatMessage>[];
  final _chatController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final room = Room(
      roomOptions: const RoomOptions(
        adaptiveStream: true,
        dynacast: true,
      ),
    );
    _listener = room.createListener()
      ..on<TrackSubscribedEvent>((event) {
        if (event.track is VideoTrack) {
          setState(() => _hostVideo = event.track as VideoTrack);
        }
      })
      ..on<DataReceivedEvent>((event) {
        if (event.topic != 'chat') return;
        final text = utf8.decode(event.data);
        setState(() {
          _messages.add(_ChatMessage(text: text, isMe: false));
        });
      });

    try {
      await room.connect(
        widget.join.wsUrl,
        widget.join.token,
      );
      _attachExistingTracks(room);
      setState(() {
        _room = room;
        _connecting = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Kết nối thất bại: $e')),
        );
        context.pop();
      }
    }
  }

  void _attachExistingTracks(Room room) {
    for (final p in room.remoteParticipants.values) {
      for (final pub in p.videoTrackPublications) {
        if (pub.subscribed && pub.track is VideoTrack) {
          _hostVideo = pub.track as VideoTrack;
          return;
        }
      }
    }
  }

  Future<void> _sendChat() async {
    final text = _chatController.text.trim();
    if (text.isEmpty || _room == null) return;
    await _room!.localParticipant?.publishData(
      utf8.encode(text),
      reliable: true,
      topic: 'chat',
    );
    setState(() {
      _messages.add(_ChatMessage(text: text, isMe: true));
    });
    _chatController.clear();
  }

  @override
  void dispose() {
    _listener?.dispose();
    _room?.disconnect();
    _chatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_connecting) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final viewerCount = _room?.remoteParticipants.length ?? 0;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            if (_hostVideo != null)
              SizedBox.expand(child: VideoTrackRenderer(_hostVideo!))
            else
              const Center(
                child: Icon(Icons.videocam_off, color: Colors.white54, size: 64),
              ),
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
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('👁 $viewerCount', style: const TextStyle(color: Colors.white70)),
                  const Spacer(),
                  IconButton(
                    icon: Icon(
                      _audioMuted ? Icons.volume_off : Icons.volume_up,
                      color: Colors.white,
                    ),
                    onPressed: () => setState(() => _audioMuted = !_audioMuted),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 72,
              left: 8,
              right: 8,
              height: 160,
              child: ListView.builder(
                itemCount: _messages.length,
                itemBuilder: (context, i) {
                  final m = _messages[i];
                  return Align(
                    alignment: m.isMe ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: m.isMe
                            ? Colors.blue.withValues(alpha: 0.85)
                            : Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(m.text, style: const TextStyle(color: Colors.white)),
                    ),
                  );
                },
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: ColoredBox(
                color: Colors.black54,
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _chatController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Chat...',
                          hintStyle: TextStyle(color: Colors.white54),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        onSubmitted: (_) => _sendChat(),
                      ),
                    ),
                    IconButton(
                      onPressed: _sendChat,
                      icon: const Icon(Icons.send, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatMessage {
  const _ChatMessage({required this.text, required this.isMe});
  final String text;
  final bool isMe;
}
