# Review Mobile App + Tính năng Livestream

> **Archival / planning.** LiveKit + `/api/live` + UI mobile đã có MVP — đừng đọc như “chưa có livestream”. Inventory: [mobile-tech-stacks.md](./mobile-tech-stacks.md), [docker.md](./docker.md).

---

## Phần 1 — Review code hiện tại

### Expo React Native (`apps/nihongo-mobile`)

**Điểm tốt (đã đúng hướng senior):**
```
✅ Clean Architecture: domain/ data/ tách rõ
✅ expo-sqlite với transaction (withTransactionAsync)
✅ Sync queue pattern (INSERT sync_queue → flush khi online)
✅ SRS algorithm tách thành pure function (utils/srs.ts)
✅ Camera translate có ML Kit
✅ useOnline hook
```

**Vấn đề cần sửa:**

```
❌ flushSyncQueue() chỉ mark 'synced' trong local, KHÔNG gọi API
   → Sync queue là vô nghĩa — chỉ đang xóa queue không push lên server

❌ State management = raw useState
   → SrsScreen: gọi refresh() thủ công sau mỗi action
   → Không reactive — nếu thêm 1 screen khác cùng xem SRS data sẽ stale
   → Senior dùng: Zustand (đơn giản) hoặc React Query + SQLite watcher

❌ Không có background sync
   → expo-background-fetch + expo-task-manager còn thiếu
   → WorkManager equivalent phải setup để sync khi app background

❌ Không có error state trong UI
   → SrsScreen: nếu getReviewQueue() throw → app crash thầm lặng
   → Cần try/catch + error state hiển thị cho user

❌ Không có auth guard
   → Route /vocab, /srs accessible khi chưa đăng nhập
   → Cần check token trong _layout.tsx

❌ Không có token interceptor
   → api.ts không có auto refresh khi 401
```

**Fix ưu tiên cho `flushSyncQueue`:**

```typescript
// src/data/api.ts — thêm hàm này
export async function batchSyncSrsCards(cards: SrsCard[]): Promise<void> {
  const token = await SecureStore.getItemAsync('access_token');
  await axios.post(`${API_BASE}/srs/batch`, { cards }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// src/data/repository.ts — sửa flushSyncQueue
async function flushSyncQueue() {
  const db = await getDatabase();
  const pending = await db.getAllAsync<{id: number; entity_id: number; payload: string}>(
    `SELECT id, entity_id, payload FROM sync_queue ORDER BY created_at ASC`,
  );
  if (pending.length === 0) return;

  // 1. Gom batch — gọi 1 API call thay vì N calls
  const cards = pending.map(item => JSON.parse(item.payload) as SrsCard);
  await batchSyncSrsCards(cards);  // ← gọi API thực sự

  // 2. Chỉ xóa queue sau khi API thành công
  const ids = pending.map(item => item.id);
  await db.runAsync(
    `DELETE FROM sync_queue WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  );
}
```

---

### Flutter (`apps/nihongo_flutter`)

**Điểm tốt:**
```
✅ Clean Architecture đầy đủ: domain/data/presentation
✅ Drift ORM với Stream reactive (watchVocabByLesson, watchDueReviewCards)
✅ Riverpod cho DI + state
✅ Dio + auth interceptor + token refresh
✅ go_router navigation
✅ Dark mode
✅ Camera + google_mlkit_text_recognition
✅ Native platform channel (native_perf_channel.dart)
✅ Repository trả Result<T> (không throw ra UI)
```

**Vấn đề:**

```
❌ Entities không dùng Freezed
   → SrsCard, Vocabulary viết toJson/fromJson tay → error prone
   → Senior: thêm freezed + json_serializable, chạy build_runner

❌ WorkManager background sync chưa có
   → pubspec.yaml thiếu workmanager package
   → SyncWorker chưa implement

❌ providers.dart wiring thủ công
   → Chưa dùng riverpod_annotation + @riverpod codegen
   → Khi có 10+ providers sẽ rất verbose

❌ Không có retry_count check trong incrementSyncRetry
   → items > 3 retries vẫn cố sync → infinite loop
```

---

## Phần 2 — Tính năng Livestream (Senior Architecture)

### Tại sao Livestream phù hợp với app này?

```
App hiện tại: 1 learner học SRS cá nhân
Livestream mở ra: Coach dạy trực tiếp → nhiều learner xem cùng lúc

Use cases:
  - Coach livestream giải bài N5/N4 (1 host, 50-200 viewers)
  - Learner hỏi qua chat/hand raise
  - Coach chia sẻ màn hình (flashcard, bài kiểm tra)
  - Recording để xem lại
```

### Video call vs Livestream — khác nhau như thế nào?

```
Video call (cursor-video-call-livekit.md):
  - 2 người, bidirectional, publish + subscribe cả 2
  - Latency < 200ms
  - Livekit Room mode: REALTIME

Livestream:
  - 1 host publish, N viewers subscribe
  - Latency 1-3 giây (acceptable, trade-off với scale)
  - Viewers không publish video (chỉ chat, reaction)
  - Livekit Room mode: LIVESTREAM (hoặc REALTIME với viewer permissions)
  - Có thể record với Egress API
```

---

## Phần 3 — Backend: Livestream API (signaling-service)

### `POST /live/sessions` — tạo phòng livestream

```typescript
// services/signaling-service/src/live/live.service.ts
import { RoomServiceClient, AccessToken, RoomAgentDispatch } from 'livekit-server-sdk';

@Injectable()
export class LiveService {
  private roomClient: RoomServiceClient;

  constructor(private readonly prisma: PrismaService) {
    this.roomClient = new RoomServiceClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
  }

  // Coach tạo phòng livestream
  async createLiveSession(coachId: number, title: string): Promise<LiveSessionDto> {
    const roomName = `live_${coachId}_${Date.now()}`;

    // Tạo room trên Livekit server
    await this.roomClient.createRoom({
      name: roomName,
      emptyTimeout: 300,         // xóa sau 5 phút nếu không ai
      maxParticipants: 200,      // giới hạn viewer
      metadata: JSON.stringify({ coachId, title }),
    });

    // Lưu vào DB
    const session = await this.prisma.liveSession.create({
      data: {
        roomName,
        coachId,
        title,
        status: 'LIVE',
        startedAt: new Date(),
      },
    });

    // Token cho host (full publish quyền)
    const hostToken = this.createToken(coachId.toString(), roomName, 'host');

    return { sessionId: session.id, roomName, token: hostToken, wsUrl: process.env.LIVEKIT_URL! };
  }

  // Viewer xin vào xem
  async joinAsViewer(userId: number, sessionId: number): Promise<ViewerTokenDto> {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId, status: 'LIVE' },
    });
    if (!session) throw new NotFoundException('Phòng không tồn tại hoặc đã kết thúc');

    // Token cho viewer (subscribe only, không publish video/audio)
    const token = this.createToken(userId.toString(), session.roomName, 'viewer');

    return { token, wsUrl: process.env.LIVEKIT_URL!, roomName: session.roomName };
  }

  // Coach kết thúc stream
  async endLiveSession(sessionId: number, coachId: number): Promise<void> {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId, coachId },
    });
    if (!session) throw new ForbiddenException();

    // Kick tất cả participants
    await this.roomClient.deleteRoom(session.roomName);

    await this.prisma.liveSession.update({
      where: { id: sessionId },
      data: { status: 'ENDED', endedAt: new Date() },
    });
  }

  private createToken(userId: string, roomName: string, role: 'host' | 'viewer'): string {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity: userId, ttl: '2h' },
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: role === 'host',          // chỉ host publish camera/mic
      canPublishData: true,                 // cả 2 đều publish data (chat, reaction)
      canSubscribe: true,                   // cả 2 subscribe
    });

    return at.toJwt();
  }
}
```

### DB schema (thêm vào prisma schema)

```prisma
model LiveSession {
  id        Int       @id @default(autoincrement())
  roomName  String    @unique
  coachId   Int
  coach     User      @relation(fields: [coachId], references: [id])
  title     String
  status    String    @default("LIVE")  // LIVE | ENDED
  startedAt DateTime  @default(now())
  endedAt   DateTime?

  @@index([status])
  @@index([coachId])
}
```

### Routes

```
POST   /api/live/sessions              → coach tạo phòng
POST   /api/live/sessions/:id/join     → viewer lấy token
DELETE /api/live/sessions/:id          → coach kết thúc
GET    /api/live/sessions              → danh sách đang live
GET    /api/live/sessions/:id/viewers  → số người xem
```

---

## Phần 4 — Flutter: Livestream UI

### pubspec.yaml — thêm Livekit

```yaml
dependencies:
  livekit_client: ^2.2.3
```

### `lib/presentation/live/live_viewer_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart';

class LiveViewerScreen extends ConsumerStatefulWidget {
  const LiveViewerScreen({
    super.key,
    required this.sessionId,
    required this.token,
    required this.wsUrl,
  });

  final int sessionId;
  final String token;
  final String wsUrl;

  @override
  ConsumerState<LiveViewerScreen> createState() => _LiveViewerScreenState();
}

class _LiveViewerScreenState extends ConsumerState<LiveViewerScreen> {
  Room? _room;
  RemoteParticipant? _host;
  VideoTrack? _hostVideo;
  AudioTrack? _hostAudio;
  bool _isConnecting = true;
  bool _audioMuted = false;

  // Chat messages từ DataChannel
  final List<_ChatMessage> _messages = [];

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final room = Room();

    room.addListener(_onRoomEvent);

    await room.connect(
      widget.wsUrl,
      widget.token,
      roomOptions: const RoomOptions(
        adaptiveStream: true,   // auto lower quality khi mạng yếu
        dynacast: true,
        defaultAudioPublishOptions: AudioPublishOptions(
          audioBitrate: 32000,  // viewer chỉ nghe, quality thấp OK
        ),
      ),
    );

    setState(() {
      _room = room;
      _isConnecting = false;
    });
  }

  void _onRoomEvent() {
    final room = _room;
    if (room == null) return;

    // Tìm host participant (coach)
    for (final participant in room.remoteParticipants.values) {
      if (_host == null) {
        _host = participant;
        participant.addListener(_onParticipantEvent);
        _attachTracks(participant);
      }
    }

    // DataChannel — chat/reactions từ host hoặc viewer khác
    // Handled via room.onDataReceived in newer livekit_client versions
  }

  void _onParticipantEvent() {
    _attachTracks(_host);
  }

  void _attachTracks(RemoteParticipant? participant) {
    if (participant == null) return;
    setState(() {
      for (final pub in participant.videoTrackPublications.values) {
        if (pub.track is RemoteVideoTrack && pub.subscribed) {
          _hostVideo = pub.track as VideoTrack;
        }
      }
      for (final pub in participant.audioTrackPublications.values) {
        if (pub.track is RemoteAudioTrack && pub.subscribed) {
          _hostAudio = pub.track as AudioTrack;
        }
      }
    });
  }

  Future<void> _sendChat(String text) async {
    await _room?.localParticipant?.publishData(
      text.codeUnits,
      reliable: true,
      topic: 'chat',
    );
    setState(() {
      _messages.add(_ChatMessage(text: text, isMe: true));
    });
  }

  @override
  void dispose() {
    _room?.removeListener(_onRoomEvent);
    _room?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isConnecting) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Video stream fullscreen
            if (_hostVideo != null)
              SizedBox.expand(
                child: VideoTrackRenderer(_hostVideo!),
              )
            else
              const Center(
                child: Icon(Icons.videocam_off, color: Colors.white54, size: 64),
              ),

            // Top bar — viewer count + mute
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: _TopBar(
                room: _room,
                onMuteToggle: () => setState(() => _audioMuted = !_audioMuted),
                audioMuted: _audioMuted,
              ),
            ),

            // Chat overlay bên dưới
            Positioned(
              bottom: 80,
              left: 0,
              right: 0,
              height: 200,
              child: _ChatOverlay(messages: _messages),
            ),

            // Chat input
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _ChatInput(onSend: _sendChat),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Host screen (coach) ──────────────────────────────────────────────────────

class LiveHostScreen extends ConsumerStatefulWidget {
  const LiveHostScreen({
    super.key,
    required this.token,
    required this.wsUrl,
    required this.sessionId,
  });

  final String token;
  final String wsUrl;
  final int sessionId;

  @override
  ConsumerState<LiveHostScreen> createState() => _LiveHostScreenState();
}

class _LiveHostScreenState extends ConsumerState<LiveHostScreen> {
  Room? _room;
  LocalVideoTrack? _localVideo;
  bool _micOn = true;
  bool _cameraOn = true;
  bool _isConnecting = true;
  int _viewerCount = 0;

  @override
  void initState() {
    super.initState();
    _startStream();
  }

  Future<void> _startStream() async {
    final room = Room();
    room.addListener(() {
      setState(() => _viewerCount = room.remoteParticipants.length);
    });

    await room.connect(widget.wsUrl, widget.token);

    // Publish camera + mic
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
      _isConnecting = false;
    });
  }

  Future<void> _endStream() async {
    await ref.read(liveServiceProvider).endSession(widget.sessionId);
    await _room?.disconnect();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _localVideo?.stop();
    _room?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isConnecting) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Preview camera của chính mình
            if (_localVideo != null)
              SizedBox.expand(child: VideoTrackRenderer(_localVideo!))
            else
              const SizedBox.expand(),

            // Top bar
            Positioned(
              top: 8,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  // Live indicator
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('LIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  // Viewer count
                  Icon(Icons.visibility, color: Colors.white, size: 16),
                  const SizedBox(width: 4),
                  Text('$_viewerCount', style: const TextStyle(color: Colors.white)),
                  const Spacer(),
                  // End button
                  TextButton(
                    onPressed: _endStream,
                    style: TextButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text('Kết thúc', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),

            // Controls
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
                  const SizedBox(width: 16),
                  // Screen share
                  _ControlButton(
                    icon: Icons.screen_share,
                    onTap: () async {
                      await _room?.localParticipant?.setScreenShareEnabled(true);
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

// ─── Helper widgets ───────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  const _TopBar({required this.room, required this.onMuteToggle, required this.audioMuted});
  final Room? room;
  final VoidCallback onMuteToggle;
  final bool audioMuted;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
            child: const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
          Icon(Icons.visibility, color: Colors.white70, size: 14),
          const SizedBox(width: 4),
          Text(
            '${room?.remoteParticipants.length ?? 0}',
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const Spacer(),
          IconButton(
            icon: Icon(audioMuted ? Icons.volume_off : Icons.volume_up, color: Colors.white),
            onPressed: onMuteToggle,
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  const _ChatMessage({required this.text, required this.isMe});
  final String text;
  final bool isMe;
}

class _ChatOverlay extends StatelessWidget {
  const _ChatOverlay({required this.messages});
  final List<_ChatMessage> messages;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      itemCount: messages.length,
      itemBuilder: (context, i) {
        final msg = messages[i];
        return Align(
          alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 2),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: msg.isMe
                  ? Colors.blue.withOpacity(0.8)
                  : Colors.black.withOpacity(0.6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(msg.text, style: const TextStyle(color: Colors.white, fontSize: 13)),
          ),
        );
      },
    );
  }
}

class _ChatInput extends StatefulWidget {
  const _ChatInput({required this.onSend});
  final void Function(String) onSend;

  @override
  State<_ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<_ChatInput> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'Chat...',
                hintStyle: TextStyle(color: Colors.white54),
                border: InputBorder.none,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send, color: Colors.white),
            onPressed: () {
              if (_controller.text.trim().isEmpty) return;
              widget.onSend(_controller.text.trim());
              _controller.clear();
            },
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
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
```

---

## Phần 5 — React Native (Expo): Livestream

### Cài package

```bash
npx expo install @livekit/react-native @livekit/react-native-webrtc
```

### `app/live-viewer.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  AudioTrack,
  Room,
  VideoTrack,
  VideoView,
  registerGlobals,
} from '@livekit/react-native';
import { useLocalSearchParams, router } from 'expo-router';

registerGlobals();

export default function LiveViewerScreen() {
  const { token, wsUrl, sessionId } = useLocalSearchParams<{
    token: string;
    wsUrl: string;
    sessionId: string;
  }>();

  const roomRef = useRef<Room | null>(null);
  const [hostVideoTrack, setHostVideoTrack] = useState<VideoTrack | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; isMe: boolean }[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const room = new Room();
    roomRef.current = room;

    room.on('participantConnected', (participant) => {
      setViewerCount((n) => n + 1);
      // Attach video track từ host
      participant.on('trackSubscribed', (track) => {
        if (track.kind === 'video') {
          setHostVideoTrack(track as VideoTrack);
        }
      });
    });

    room.on('participantDisconnected', () => {
      setViewerCount((n) => Math.max(0, n - 1));
    });

    room.on('dataReceived', (payload, participant, kind, topic) => {
      if (topic === 'chat') {
        const text = new TextDecoder().decode(payload);
        setMessages((prev) => [...prev, { text, isMe: false }]);
      }
    });

    room.connect(wsUrl, token).then(() => setConnected(true));

    return () => {
      room.disconnect();
    };
  }, [token, wsUrl]);

  const sendChat = async () => {
    if (!chatInput.trim() || !roomRef.current) return;
    const data = new TextEncoder().encode(chatInput.trim());
    await roomRef.current.localParticipant.publishData(data, { reliable: true, topic: 'chat' });
    setMessages((prev) => [...prev, { text: chatInput.trim(), isMe: true }]);
    setChatInput('');
  };

  if (!connected) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Đang kết nối...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video */}
      {hostVideoTrack ? (
        <VideoView style={styles.video} videoTrack={hostVideoTrack} />
      ) : (
        <View style={[styles.video, styles.noVideo]}>
          <Text style={{ color: '#fff' }}>Chờ coach bắt đầu...</Text>
        </View>
      )}

      {/* LIVE badge + viewer count */}
      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>👁 {viewerCount}</Text>
      </View>

      {/* Chat overlay */}
      <View style={styles.chatOverlay}>
        {messages.slice(-5).map((m, i) => (
          <View key={i} style={[styles.chatBubble, m.isMe && styles.chatBubbleMe]}>
            <Text style={styles.chatText}>{m.text}</Text>
          </View>
        ))}
      </View>

      {/* Chat input */}
      <View style={styles.chatInput}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Chat..."
          placeholderTextColor="#888"
          style={styles.input}
          onSubmitEditing={sendChat}
        />
        <TouchableOpacity onPress={sendChat} style={styles.sendBtn}>
          <Text style={{ color: '#fff' }}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  video: { ...StyleSheet.absoluteFillObject },
  noVideo: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  liveText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  viewerCount: { color: '#fff', fontSize: 13 },
  chatOverlay: {
    position: 'absolute',
    bottom: 64,
    left: 8,
    right: 8,
    gap: 4,
  },
  chatBubble: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  chatBubbleMe: { alignSelf: 'flex-end', backgroundColor: 'rgba(59,130,246,0.8)' },
  chatText: { color: '#fff', fontSize: 13 },
  chatInput: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    gap: 8,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 8 },
});
```

---

## Phần 6 — Tính năng Livestream hoàn chỉnh (checklist senior)

### Core features

```
✅ Host publish camera + mic
✅ Viewer subscribe only (không publish video)
✅ DataChannel chat (reliable=true)
✅ Viewer count
✅ Mute control cho viewer
✅ End stream (coach)
✅ Screen share (coach dạy flashcard)
```

### Advanced features (làm thêm)

```
📋 Hand raise
   → Viewer gửi DataChannel { type: 'hand-raise', userId }
   → Coach nhận → cho phép viewer publish mic tạm thời
   → Sau Q&A → revoke publish permission

📋 Recording (Livekit Egress API)
   POST /live/sessions/:id/record
   → roomClient.startRoomCompositeEgress({ roomName, output: { s3: {...} } })
   → Lưu URL video để xem lại

📋 Reactions (emoji floats)
   → DataChannel { type: 'reaction', emoji: '🔥' }
   → Client animate emoji floating lên màn hình

📋 Live session list (discover page)
   GET /api/live/sessions
   → List coach đang live
   → Thumbnail từ Livekit snapshot API

📋 Push notification khi coach bắt đầu live
   → Kafka event: edu.live.started
   → Notification service push FCM/APNs
```

### Connection quality (senior pattern)

```dart
// Flutter — auto degrade quality khi mạng yếu
room.addListener(() {
  for (final participant in room.remoteParticipants.values) {
    final quality = participant.connectionQuality;
    if (quality == ConnectionQuality.poor) {
      // Suggest user switch to audio-only
      showSnackBar('Mạng yếu, chuyển sang chế độ âm thanh?');
    }
  }
});
```

---

## Phần 7 — Tóm tắt review + roadmap

### Expo React Native — cần sửa ngay

```
1. flushSyncQueue() phải gọi API thực sự (xem fix ở trên)
2. Thêm auth guard trong _layout.tsx
3. Error state trong SrsScreen
4. Background sync: expo-task-manager + expo-background-fetch
```

### Flutter — cần sửa ngay

```
1. Thêm workmanager để sync background
2. Thêm freezed + json_serializable cho entities
3. Kiểm tra retry_count < 3 trước khi sync
```

### Livestream — thứ tự làm

```
Step 1: Backend
  - Thêm LiveSession model vào prisma
  - POST /live/sessions (tạo phòng)
  - POST /live/sessions/:id/join (viewer token)
  - DELETE /live/sessions/:id (end stream)

Step 2: Flutter host screen
  - LiveHostScreen (publish cam + mic)
  - Chat DataChannel

Step 3: Flutter viewer screen
  - LiveViewerScreen (subscribe only)
  - Chat + reaction overlay

Step 4: React Native viewer screen (port từ Flutter logic)

Step 5: Advanced
  - Hand raise
  - Recording
  - Push notification khi live
```
