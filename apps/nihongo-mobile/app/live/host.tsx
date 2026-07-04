import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Room, RoomEvent } from 'livekit-client';

import { endLiveSession } from '../../src/data/liveApi';

export default function LiveHostScreen() {
  const { token, wsUrl, sessionId } = useLocalSearchParams<{
    token: string;
    wsUrl: string;
    sessionId: string;
  }>();

  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !wsUrl) return;

    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.ParticipantConnected, () => {
      setViewerCount(room.remoteParticipants.size);
    });
    room.on(RoomEvent.ParticipantDisconnected, () => {
      setViewerCount(room.remoteParticipants.size);
    });

    (async () => {
      try {
        await room.connect(wsUrl, token);
        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(true);
        setConnected(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không phát live được');
      }
    })();

    return () => {
      room.disconnect();
    };
  }, [token, wsUrl]);

  const onEnd = async () => {
    if (sessionId) {
      try {
        await endLiveSession(Number(sessionId));
      } catch (_) {}
    }
    await roomRef.current?.disconnect();
    router.back();
  };

  const toggleMic = async () => {
    await roomRef.current?.localParticipant.setMicrophoneEnabled(!micOn);
    setMicOn(!micOn);
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
        <Text style={styles.hint}>Đang mở phòng live...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <Text style={styles.hint}>
          Camera/mic đã publish qua LiveKit{'\n'}
          (render preview cần dev build + @livekit/react-native)
        </Text>
      </View>

      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewer}>👁 {viewerCount}</Text>
        <Pressable style={styles.endBtn} onPress={onEnd}>
          <Text style={styles.endText}>Kết thúc</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.ctrl} onPress={toggleMic}>
          <Text style={styles.ctrlText}>{micOn ? '🎤' : '🔇'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hint: { color: '#fff', textAlign: 'center', lineHeight: 22 },
  error: { color: '#f87171', padding: 24, textAlign: 'center' },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveText: { color: '#fff', fontWeight: '700' },
  viewer: { color: '#fff', flex: 1 },
  endBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  endText: { color: '#fff', fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctrl: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlText: { fontSize: 24 },
});
