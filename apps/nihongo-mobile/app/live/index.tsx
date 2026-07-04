import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createLiveSession,
  joinLiveSession,
  listLiveSessions,
  type LiveSessionSummary,
} from '../../src/data/liveApi';

export default function LiveListScreen() {
  const [sessions, setSessions] = useState<LiveSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await listLiveSessions());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onJoin = async (session: LiveSessionSummary) => {
    try {
      const join = await joinLiveSession(session.id);
      router.push({
        pathname: '/live/viewer',
        params: {
          token: join.token,
          wsUrl: join.wsUrl,
          sessionId: String(join.sessionId),
          title: join.title ?? session.title,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cần đăng nhập để xem');
    }
  };

  const onStartHost = async () => {
    try {
      const join = await createLiveSession('Livestream Nihongo');
      router.push({
        pathname: '/live/host',
        params: {
          token: join.token,
          wsUrl: join.wsUrl,
          sessionId: String(join.sessionId),
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cần tài khoản coach + LiveKit');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có phòng live</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onJoin(item)}>
            <Text style={styles.live}>● LIVE</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.coach?.name ?? 'Coach'}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={onStartHost}>
        <Text style={styles.fabText}>Phát live (coach)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 48, color: '#6b7280' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  live: { color: '#ef4444', fontWeight: '700', fontSize: 12 },
  title: { fontSize: 17, fontWeight: '600', marginTop: 4 },
  sub: { color: '#6b7280', marginTop: 2 },
  fab: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  fabText: { color: '#fff', fontWeight: '600' },
});
