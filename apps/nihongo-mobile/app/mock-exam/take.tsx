import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';

type Question = {
  id: string;
  type: string;
  question: string;
  options: string[];
  section?: string;
};

type ExamSession = {
  examId: string;
  durationMinutes: number;
  questions: Question[];
};

type SubmitResult = {
  score: number;
  total: number;
  correct: number;
  breakdown?: Record<string, { correct: number; total: number }>;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function MockExamTakeScreen() {
  const { slug, title, duration } = useLocalSearchParams<{
    slug: string;
    title: string;
    duration: string;
  }>();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Start exam
  useEffect(() => {
    fetch(`${API_BASE_URL}/mock-exams/${slug}/start`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        setSession(data as ExamSession);
        setTimeLeft((data as ExamSession).durationMinutes * 60);
        setLoading(false);
      })
      .catch(() => {
        setError('Không tạo được đề thi. Thử lại sau.');
        setLoading(false);
      });
  }, [slug]);

  // Countdown
  useEffect(() => {
    if (!session || result || submitting) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          void doSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session, result, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSubmit = useCallback(async () => {
    if (!session || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/mock-exams/${session.examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersRef.current }),
      });
      const data = (await res.json()) as SubmitResult;
      setResult(data);
    } catch {
      Alert.alert('Lỗi', 'Nộp bài thất bại. Hãy thử lại.');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [session]);

  const handleSubmit = () => {
    const answered = Object.keys(answers).length;
    const total = session?.questions.length ?? 0;
    const remaining = total - answered;
    if (remaining > 0) {
      Alert.alert(
        'Nộp bài?',
        `Còn ${remaining} câu chưa trả lời. Bạn có chắc muốn nộp không?`,
        [
          { text: 'Ở lại', style: 'cancel' },
          { text: 'Nộp bài', style: 'destructive', onPress: () => void doSubmit() },
        ],
      );
    } else {
      void doSubmit();
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Đang tạo đề thi...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Không tải được đề thi'}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  // ── Result ──
  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const passed = pct >= 60;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContainer}>
        <View style={[styles.resultCard, { borderColor: passed ? '#22c55e' : '#ef4444' }]}>
          <Text style={styles.resultEmoji}>{passed ? '🎉' : '📚'}</Text>
          <Text style={styles.resultTitle}>{passed ? 'Đạt!' : 'Chưa đạt'}</Text>
          <Text style={styles.resultScore}>
            {result.correct}/{result.total} câu đúng
          </Text>
          <Text style={[styles.resultPct, { color: passed ? '#22c55e' : '#ef4444' }]}>
            {pct}%
          </Text>
        </View>

        {result.breakdown && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Chi tiết theo phần</Text>
            {Object.entries(result.breakdown).map(([section, s]) => (
              <View key={section} style={styles.breakdownRow}>
                <Text style={styles.breakdownSection}>{section}</Text>
                <Text style={styles.breakdownVal}>
                  {s.correct}/{s.total}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Chọn đề khác</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Exam ──
  const q = session.questions[currentIndex];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const answered = Object.keys(answers).length;
  const timerWarning = timeLeft < 300;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
        <View style={[styles.timer, timerWarning && styles.timerWarning]}>
          <Text style={[styles.timerText, timerWarning && styles.timerTextWarning]}>
            ⏱ {pad(mins)}:{pad(secs)}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(answered / session.questions.length) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {answered}/{session.questions.length} câu đã trả lời
      </Text>

      {/* Question */}
      <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
        {q.section ? (
          <Text style={styles.sectionLabel}>{q.section}</Text>
        ) : null}
        <Text style={styles.qNumber}>Câu {currentIndex + 1}/{session.questions.length}</Text>
        <Text style={styles.qText}>{q.question}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => {
            const letter = ['A', 'B', 'C', 'D'][i];
            const selected = answers[q.id] === opt;
            return (
              <Pressable
                key={i}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
              >
                <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                  <Text style={[styles.optionLetterText, selected && { color: '#fff' }]}>
                    {letter}
                  </Text>
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Nav */}
      <View style={styles.navBar}>
        <Pressable
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => i - 1)}
        >
          <Text style={styles.navBtnText}>← Trước</Text>
        </Pressable>

        {currentIndex < session.questions.length - 1 ? (
          <Pressable
            style={styles.navBtn}
            onPress={() => setCurrentIndex((i) => i + 1)}
          >
            <Text style={styles.navBtnText}>Sau →</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.navBtn, styles.submitBtn]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Đang nộp...' : 'Nộp bài ✓'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ef' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginBottom: 16 },

  topBar: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  topTitle: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 12 },
  timer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timerWarning: { backgroundColor: '#fff' },
  timerText: { color: '#fff', fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] },
  timerTextWarning: { color: '#dc2626' },

  progressBar: { height: 4, backgroundColor: '#e5e7eb' },
  progressFill: { height: 4, backgroundColor: '#dc2626' },
  progressText: { fontSize: 11, color: '#9ca3af', textAlign: 'right', paddingRight: 14, paddingTop: 4 },

  questionScroll: { flex: 1 },
  questionContent: { padding: 20, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#dc2626',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  qNumber: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  qText: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 24, marginBottom: 20 },

  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  optionSelected: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  optionLetterSelected: { backgroundColor: '#dc2626' },
  optionLetterText: { fontWeight: '700', fontSize: 13, color: '#374151' },
  optionText: { flex: 1, fontSize: 14, color: '#374151' },
  optionTextSelected: { color: '#dc2626', fontWeight: '600' },

  navBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  navBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 10, backgroundColor: '#f3f4f6',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontWeight: '600', color: '#374151', fontSize: 14 },
  submitBtn: { backgroundColor: '#dc2626' },
  submitBtnText: { fontWeight: '700', color: '#fff', fontSize: 14 },

  // Result
  resultContainer: { padding: 24, alignItems: 'center', gap: 16 },
  resultCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20,
    padding: 32, alignItems: 'center', borderWidth: 2,
  },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  resultScore: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  resultPct: { fontSize: 48, fontWeight: '900', marginTop: 8 },

  breakdownCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
  },
  breakdownTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  breakdownSection: { fontSize: 13, color: '#374151' },
  breakdownVal: { fontSize: 13, fontWeight: '700', color: '#111827' },

  primaryBtn: {
    width: '100%', backgroundColor: '#dc2626', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn: { marginTop: 12 },
  backBtnText: { color: '#dc2626', fontSize: 14 },
});
