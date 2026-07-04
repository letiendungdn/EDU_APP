import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { NavCard } from '../src/components/NavCard';
import { useOnline } from '../src/hooks/useOnline';

export default function HomeScreen() {
  const online = useOnline();

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Trạng thái:</Text>
        <Text style={[styles.statusValue, !online && styles.offline]}>
          {online ? 'Online' : 'Offline'}
        </Text>
      </View>

      <NavCard
        title="Từ vựng bài 1"
        subtitle="Đọc offline từ SQLite, sync khi có mạng"
        onPress={() => router.push('/vocab')}
      />
      <NavCard
        title="Ôn tập SRS"
        subtitle="Spaced repetition — SM-2"
        onPress={() => router.push('/srs')}
      />
      <NavCard
        title="Dịch camera"
        subtitle="Nhận chữ & dịch trực tiếp trên camera"
        onPress={() => router.push('/camera-translate')}
      />
      <NavCard
        title="Livestream"
        subtitle="Xem coach dạy trực tiếp"
        onPress={() => router.push('/live')}
      />
      <NavCard
        title="Đăng nhập"
        subtitle="Sync tiến độ lên server"
        onPress={() => router.push('/login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusLabel: { color: '#6b7280' },
  statusValue: { color: '#1d4ed8', fontWeight: '600' },
  offline: { color: '#dc2626' },
});
