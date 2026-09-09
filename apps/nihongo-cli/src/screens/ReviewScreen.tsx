import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useSrsQueue, useSubmitSrs} from '../hooks/useVocab';

type Phase = 'question' | 'answer';

export default function ReviewScreen() {
  const {data: queue, isLoading, isError} = useSrsQueue();
  const submitSrs = useSubmitSrs();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lỗi tải thẻ ôn tập</Text>
      </View>
    );
  }

  const cards = queue ?? [];

  if (cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneTitle}>Xong rồi!</Text>
        <Text style={styles.doneSub}>Không còn thẻ nào cần ôn hôm nay</Text>
        {sessionTotal > 0 && (
          <Text style={styles.doneScore}>
            Kết quả: {sessionCorrect}/{sessionTotal} đúng
          </Text>
        )}
      </View>
    );
  }

  if (index >= cards.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.doneEmoji}>✅</Text>
        <Text style={styles.doneTitle}>Hoàn thành phiên!</Text>
        <Text style={styles.doneScore}>
          {sessionCorrect}/{sessionTotal} câu đúng (
          {Math.round((sessionCorrect / sessionTotal) * 100)}%)
        </Text>
      </View>
    );
  }

  const card = cards[index];

  const handleQuality = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    setSessionTotal(t => t + 1);
    if (quality >= 3) setSessionCorrect(c => c + 1);

    await submitSrs.mutateAsync({vocabId: card.vocabId, quality});
    setIndex(i => i + 1);
    setPhase('question');
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: `${(index / cards.length) * 100}%`}]} />
      </View>
      <Text style={styles.progressText}>
        {index}/{cards.length} thẻ
      </Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardWord}>{card.word}</Text>
        {phase === 'answer' ? (
          <>
            <Text style={styles.reading}>{card.reading}</Text>
            <Text style={styles.meaning}>{card.meaning}</Text>
          </>
        ) : (
          <Text style={styles.hint}>Nhấn để xem đáp án</Text>
        )}
      </View>

      {phase === 'question' ? (
        <Pressable style={styles.showBtn} onPress={() => setPhase('answer')}>
          <Text style={styles.showBtnText}>Xem đáp án</Text>
        </Pressable>
      ) : (
        <View style={styles.qualityRow}>
          <QualityBtn label="Quên" color="#ef4444" onPress={() => handleQuality(0)} />
          <QualityBtn label="Khó" color="#f59e0b" onPress={() => handleQuality(2)} />
          <QualityBtn label="Tốt" color="#3b82f6" onPress={() => handleQuality(4)} />
          <QualityBtn label="Dễ" color="#22c55e" onPress={() => handleQuality(5)} />
        </View>
      )}
    </View>
  );
}

function QualityBtn({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.qualityBtn,
        {backgroundColor: color},
        pressed && {opacity: 0.8},
      ]}
      onPress={onPress}>
      <Text style={styles.qualityBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f3ef', padding: 20},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  progressBar: {height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 6},
  progressFill: {height: 6, backgroundColor: '#dc2626', borderRadius: 3},
  progressText: {fontSize: 12, color: '#9ca3af', textAlign: 'right', marginBottom: 24},
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardWord: {fontSize: 48, fontWeight: '800', color: '#111827', marginBottom: 12},
  reading: {fontSize: 20, color: '#6b7280', marginBottom: 8},
  meaning: {fontSize: 18, color: '#374151', fontWeight: '600', textAlign: 'center'},
  hint: {fontSize: 14, color: '#9ca3af', fontStyle: 'italic'},
  showBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  showBtnText: {color: '#fff', fontWeight: '700', fontSize: 16},
  qualityRow: {flexDirection: 'row', gap: 10},
  qualityBtn: {flex: 1, borderRadius: 12, padding: 16, alignItems: 'center'},
  qualityBtnText: {color: '#fff', fontWeight: '700', fontSize: 13},
  errorText: {color: '#dc2626', fontSize: 14},
  doneEmoji: {fontSize: 56, marginBottom: 12},
  doneTitle: {fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8},
  doneSub: {fontSize: 14, color: '#6b7280'},
  doneScore: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
});
