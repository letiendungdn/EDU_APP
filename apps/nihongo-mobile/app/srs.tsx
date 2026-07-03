import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getReviewQueue, updateSrsCard } from '../src/data/repository';
import type { ReviewCard } from '../src/domain/entities';
import { calculateNextReview } from '../src/utils/srs';

export default function SrsScreen() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const refresh = useCallback(async () => {
    const queue = await getReviewQueue();
    setCards(queue);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const current = cards[0];

  const onReview = async (quality: number) => {
    if (!current) return;
    const updated = calculateNextReview(current.card, quality);
    await updateSrsCard(updated);
    await refresh();
  };

  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Không có thẻ cần ôn hôm nay</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.remaining}>Còn {cards.length} thẻ</Text>

      <View style={styles.card}>
        <Text style={styles.kana}>{current.kana}</Text>
        {current.kanji ? <Text style={styles.kanji}>{current.kanji}</Text> : null}
        {showAnswer ? (
          <>
            <Text style={styles.meaning}>{current.meaning}</Text>
            {current.romaji ? (
              <Text style={styles.romaji}>{current.romaji}</Text>
            ) : null}
          </>
        ) : null}
      </View>

      {!showAnswer ? (
        <Pressable style={styles.primaryBtn} onPress={() => setShowAnswer(true)}>
          <Text style={styles.primaryBtnText}>Xem đáp án</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          {(
            [
              ['Quên', 0],
              ['Khó', 2],
              ['OK', 3],
              ['Dễ', 5],
            ] as const
          ).map(([label, q]) => (
            <Pressable key={label} style={styles.outlineBtn} onPress={() => onReview(q)}>
              <Text style={styles.outlineBtnText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, color: '#6b7280' },
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  remaining: { fontWeight: '600', marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  kana: { fontSize: 36, fontWeight: '700' },
  kanji: { fontSize: 24, marginTop: 8 },
  meaning: { fontSize: 18, marginTop: 16 },
  romaji: { color: '#6b7280', marginTop: 8 },
  primaryBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  outlineBtnText: { color: '#1d4ed8', fontWeight: '600' },
});
