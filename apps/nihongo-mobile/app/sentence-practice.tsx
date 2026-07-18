import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { analyzeSentence, type SentenceFeedback } from '../src/data/api';

interface FeedbackEntry {
  sentence: string;
  feedback: SentenceFeedback;
}

export default function SentencePracticeScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<FeedbackEntry[]>([]);

  const onSubmit = async () => {
    const sentence = input.trim();
    if (!sentence || loading) return;

    setLoading(true);
    setError(null);
    try {
      const feedback = await analyzeSentence(sentence);
      setHistory((prev) => [{ sentence, feedback }, ...prev]);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>← Quay lại</Text>
          </Pressable>
          <Text style={styles.title}>Luyện câu AI</Text>
          <Text style={styles.subtitle}>Nhập câu tiếng Nhật (hoặc "Dịch: …" tiếng Việt) — Gemini sẽ phân tích</Text>
        </View>

        {/* History */}
        {history.map((entry, i) => (
          <FeedbackCard key={i} entry={entry} />
        ))}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#ef4444" />
            <Text style={styles.loadingText}>Đang phân tích…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="VD: 私は日本語を勉強します"
          multiline
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          editable={!loading}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            (!input.trim() || loading) && styles.sendBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
          onPress={onSubmit}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Phân tích</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function FeedbackCard({ entry }: { entry: FeedbackEntry }) {
  const { sentence, feedback } = entry;
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackQuestion}>{sentence}</Text>

      {feedback.corrected ? (
        <View style={styles.correctedRow}>
          <Text style={styles.correctedLabel}>Sửa: </Text>
          <Text style={styles.correctedText}>{feedback.corrected}</Text>
        </View>
      ) : (
        <View style={styles.correctRow}>
          <Text style={styles.correctText}>✓ Câu đúng</Text>
        </View>
      )}

      {feedback.reading ? (
        <Text style={styles.fieldText}>
          <Text style={styles.fieldLabel}>Đọc: </Text>
          {feedback.reading}
        </Text>
      ) : null}

      {feedback.meaning ? (
        <Text style={styles.fieldText}>
          <Text style={styles.fieldLabel}>Nghĩa: </Text>
          {feedback.meaning}
        </Text>
      ) : null}

      {feedback.explanation ? (
        <Text style={styles.fieldText}>
          <Text style={styles.fieldLabel}>Giải thích: </Text>
          {feedback.explanation}
        </Text>
      ) : null}

      {feedback.examples.length > 0 ? (
        <View style={styles.examples}>
          <Text style={styles.fieldLabel}>Ví dụ:</Text>
          {feedback.examples.map((ex, i) => (
            <Text key={i} style={styles.exampleItem}>・{ex}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f3ef' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8, gap: 12 },

  header: { marginBottom: 4 },
  back: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  feedbackQuestion: { fontSize: 18, fontWeight: '600', color: '#111827' },
  correctedRow: { flexDirection: 'row', flexWrap: 'wrap' },
  correctedLabel: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  correctedText: { fontSize: 13, color: '#ef4444' },
  correctRow: {},
  correctText: { fontSize: 13, color: '#22c55e', fontWeight: '600' },
  fieldText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  fieldLabel: { fontWeight: '600', color: '#6b7280' },
  examples: { gap: 4 },
  exampleItem: { fontSize: 13, color: '#374151', paddingLeft: 4 },

  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  loadingText: { color: '#ef4444', fontSize: 14 },

  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 13 },

  inputBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f3ef',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendBtnDisabled: { backgroundColor: '#fca5a5' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
