import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Room, RoomEvent } from 'livekit-client';

export default function LiveViewerScreen() {
  const { token, wsUrl, title } = useLocalSearchParams<{
    token: string;
    wsUrl: string;
    sessionId: string;
    title?: string;
  }>();

  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; isMe: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !wsUrl) return;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'video') setHasVideo(true);
    });
    room.on(RoomEvent.ParticipantConnected, () => {
      setViewerCount(room.remoteParticipants.size);
    });
    room.on(RoomEvent.ParticipantDisconnected, () => {
      setViewerCount(room.remoteParticipants.size);
    });
    room.on(RoomEvent.DataReceived, (payload, _p, _k, topic) => {
      if (topic === 'chat') {
        const text = new TextDecoder().decode(payload);
        setMessages((prev) => [...prev, { text, isMe: false }]);
      }
    });

    room
      .connect(wsUrl, token)
      .then(() => setConnected(true))
      .catch((e) => setError(e instanceof Error ? e.message : 'Kết nối thất bại'));

    return () => {
      room.disconnect();
    };
  }, [token, wsUrl]);

  const sendChat = async () => {
    const room = roomRef.current;
    if (!room || !chatInput.trim()) return;
    const data = new TextEncoder().encode(chatInput.trim());
    await room.localParticipant.publishData(data, { reliable: true, topic: 'chat' });
    setMessages((prev) => [...prev, { text: chatInput.trim(), isMe: true }]);
    setChatInput('');
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!connected) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.hint}>Đang kết nối...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.video, styles.noVideo]}>
        <Text style={styles.hint}>
          {hasVideo
            ? 'Video đang phát (cần dev build + @livekit/react-native để render)'
            : title ?? 'Chờ coach bắt đầu...'}
        </Text>
      </View>

      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>👁 {viewerCount}</Text>
      </View>

      <View style={styles.chatOverlay}>
        {messages.slice(-5).map((m, i) => (
          <View key={i} style={[styles.chatBubble, m.isMe && styles.chatBubbleMe]}>
            <Text style={styles.chatText}>{m.text}</Text>
          </View>
        ))}
      </View>

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
  video: { ...StyleSheet.absoluteFill },
  noVideo: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  hint: { color: '#fff', marginTop: 8, textAlign: 'center' },
  error: { color: '#f87171', padding: 24, textAlign: 'center' },
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
  chatOverlay: { position: 'absolute', bottom: 64, left: 8, right: 8, gap: 4 },
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
