import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getReviewQueue, updateSrsCard } from '../src/data/repository';
import type { ReviewCard } from '../src/domain/entities';
import { calculateNextReview } from '../src/utils/srs';

const RATING_BUTTONS = [
  { label: 'Lại', emoji: '😵', quality: 1, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Khó', emoji: '😅', quality: 2, color: '#f97316', bg: '#fff7ed' },
  { label: 'Ổn',  emoji: '🙂', quality: 3, color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Dễ',  emoji: '😎', quality: 4, color: '#3b82f6', bg: '#eff6ff' },
] as const;

export default function SrsScreen() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  // Track initial queue length so "done" differs from "empty"
  const initialCountRef = useRef(0);

  const refresh = useCallback(async (resetSession = false) => {
    const queue = await getReviewQueue();
    if (resetSession) {
      initialCountRef.current = queue.length;
      setSessionTotal(0);
      setSessionCorrect(0);
    }
    setCards(queue);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  const onReview = async (quality: number) => {
    const current = cards[0];
    if (!current) return;

    const updated = calculateNextReview(current.card, quality);
    await updateSrsCard(updated);

    setSessionTotal((n) => n + 1);
    if (quality >= 3) setSessionCorrect((n) => n + 1);

    await refresh();
  };

  const current = cards[0];

  // No cards left but session was active → Done screen
  if (!current && sessionTotal > 0) {
    const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    return (
      <View style={styles.center}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneTitle}>Hoàn thành!</Text>
        <Text style={styles.doneSub}>
          {sessionCorrect}/{sessionTotal} đúng ({pct}%)
        </Text>
        <Pressable style={styles.restartBtn} onPress={() => refresh(true)}>
          <Text style={styles.restartBtnText}>Ôn lại</Text>
        </Pressable>
        <Pressable style={styles.homeBtn} onPress={() => router.back()}>
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  // No cards at all → Empty screen
  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>✅</Text>
        <Text style={styles.emptyTitle}>Không có thẻ cần ôn</Text>
        <Text style={styles.emptySub}>Hẹn gặp lại ngày mai!</Text>
        <Pressable style={styles.homeBtn} onPress={() => router.back()}>
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  const progress = sessionTotal / Math.max(initialCountRef.current, 1);

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.progressLabel}>
        {sessionTotal}/{initialCountRef.current} · {cards.length} còn lại
      </Text>

      {/* Card */}
      <Pressable style={styles.card} onPress={() => !showAnswer && setShowAnswer(true)}>
        <Text style={styles.kana}>{current.kana}</Text>
        {current.kanji ? <Text style={styles.kanji}>{current.kanji}</Text> : null}
        {showAnswer ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.meaning}>{current.meaning}</Text>
            {current.romaji ? (
              <Text style={styles.romaji}>{current.romaji}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.tapHint}>Nhấn để xem đáp án</Text>
        )}
      </Pressable>

      {/* Actions */}
      {!showAnswer ? (
        <Pressable style={styles.primaryBtn} onPress={() => setShowAnswer(true)}>
          <Text style={styles.primaryBtnText}>Xem đáp án</Text>
        </Pressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ratingRow}>
          {RATING_BUTTONS.map(({ label, emoji, quality, color, bg }) => (
            <Pressable
              key={quality}
              style={({ pressed }) => [
                styles.ratingBtn,
                { backgroundColor: bg, borderColor: color },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => onReview(quality)}
            >
              <Text style={styles.ratingEmoji}>{emoji}</Text>
              <Text style={[styles.ratingLabel, { color }]}>{label}</Text>
              <Text style={[styles.ratingQuality, { color }]}>{quality}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f3ef' },

  progressTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { backgroundColor: '#ef4444', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    gap: 8,
  },
  kana: { fontSize: 42, fontWeight: '700', color: '#111827' },
  kanji: { fontSize: 28, color: '#374151' },
  divider: { width: 48, height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  meaning: { fontSize: 20, color: '#374151', textAlign: 'center' },
  romaji: { fontSize: 14, color: '#6b7280' },
  tapHint: { fontSize: 13, color: '#d1d5db', marginTop: 16 },

  primaryBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  ratingRow: { flexGrow: 0 },
  ratingBtn: {
    width: 76,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  ratingEmoji: { fontSize: 24 },
  ratingLabel: { fontSize: 15, fontWeight: '700' },
  ratingQuality: { fontSize: 11, fontWeight: '600', opacity: 0.7 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f5f3ef',
    gap: 8,
  },
  doneEmoji: { fontSize: 64, marginBottom: 8 },
  doneTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
  doneSub: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  emptyEmoji: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 15, color: '#6b7280', marginBottom: 16 },
  restartBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  restartBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  homeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  homeBtnText: { color: '#6b7280', fontSize: 15 },
});
