import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';

type ExamTemplate = {
  id: number;
  slug: string;
  title: string;
  level: string;
  durationMinutes: number;
  questionCount?: number;
  scope?: string | null;
};

const LEVEL_COLOR: Record<string, string> = {
  n5: '#22c55e',
  n4: '#3b82f6',
  n3: '#f59e0b',
  n2: '#ef4444',
  n1: '#8b5cf6',
};

export default function MockExamListScreen() {
  const [exams, setExams] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/mock-exams`)
      .then((r) => r.json())
      .then((data) => {
        setExams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Không tải được danh sách đề thi');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Đang tải đề thi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Mock Exam JLPT</Text>
        <Text style={styles.headerSub}>Chọn đề thi theo trình độ</Text>
      </View>

      <FlatList
        data={exams}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const color = LEVEL_COLOR[item.level?.toLowerCase()] ?? '#6b7280';
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() =>
                router.push({
                  pathname: '/mock-exam/take',
                  params: { slug: item.slug, title: item.title, duration: item.durationMinutes },
                })
              }
            >
              <View style={[styles.levelBadge, { backgroundColor: color }]}>
                <Text style={styles.levelText}>{item.level?.toUpperCase()}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.scope ? (
                  <Text style={styles.cardScope}>{item.scope}</Text>
                ) : null}
                <View style={styles.cardMeta}>
                  <Text style={styles.metaItem}>⏱ {item.durationMinutes} phút</Text>
                  {item.questionCount ? (
                    <Text style={styles.metaItem}>❓ {item.questionCount} câu</Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Chưa có đề thi nào.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ef' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  emptyText: { color: '#6b7280', fontSize: 14 },

  header: {
    backgroundColor: '#dc2626',
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: { opacity: 0.85 },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardScope: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { fontSize: 12, color: '#9ca3af' },
  arrow: { fontSize: 22, color: '#d1d5db' },
});
