import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavCard } from '../src/components/NavCard';
import { useOnline } from '../src/hooks/useOnline';

export default function HomeScreen() {
  const online = useOnline();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroFlag}>🇯🇵</Text>
        <Text style={styles.heroTitle}>Học tiếng Nhật</Text>
        <Text style={styles.heroSub}>Offline-first · SM-2 SRS · AI Gemini</Text>
        <View style={[styles.statusPill, !online && styles.statusPillOffline]}>
          <View style={[styles.statusDot, !online && styles.statusDotOffline]} />
          <Text style={[styles.statusText, !online && styles.statusTextOffline]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Section: Học tập */}
      <Text style={styles.sectionLabel}>HỌC TẬP</Text>
      <NavCard
        icon="📖"
        title="Từ vựng"
        subtitle="Đọc offline từ SQLite, sync khi có mạng"
        onPress={() => router.push('/vocab')}
      />
      <NavCard
        icon="🔁"
        title="Ôn tập SRS"
        subtitle="Spaced repetition — SM-2 algorithm"
        onPress={() => router.push('/srs')}
      />

      {/* Section: Luyện tập */}
      <Text style={styles.sectionLabel}>LUYỆN TẬP</Text>
      <NavCard
        icon="🤖"
        title="Luyện câu AI"
        subtitle="Phân tích & sửa câu bằng Gemini"
        badge="MỚI"
        onPress={() => router.push('/sentence-practice')}
      />
      <NavCard
        icon="📷"
        title="Dịch camera"
        subtitle="Nhận chữ & dịch trực tiếp trên camera"
        onPress={() => router.push('/camera-translate')}
      />

      {/* Section: AI & Livestream */}
      <Text style={styles.sectionLabel}>AI & LIVESTREAM</Text>
      <NavCard
        icon="📡"
        title="Livestream"
        subtitle="Xem coach dạy trực tiếp"
        onPress={() => router.push('/live')}
      />
      <NavCard
        icon="👤"
        title="Đăng nhập"
        subtitle="Sync tiến độ lên server"
        onPress={() => router.push('/login')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f5f3ef' },
  container: { padding: 16, paddingBottom: 32 },

  hero: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heroFlag: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
  heroSub: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusPillOffline: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusDotOffline: { backgroundColor: '#ef4444' },
  statusText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  statusTextOffline: { color: '#dc2626' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
});
