import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { askAiTutor } from '../src/data/api';

type Msg = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = [
  'から vs ので khác nhau thế nào?',
  'て-form dùng khi nào?',
  'Giải thích は vs が',
  'Cách đếm đồ vật trong tiếng Nhật',
];

export default function AiTutorScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    const next = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(next);
    setLoading(true);
    try {
      const answer = await askAiTutor({
        question: trimmed,
        history: next.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.text,
        })),
      });
      setMessages([...next, { role: 'assistant', text: answer || 'Không có câu trả lời.' }]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
        {messages.length === 0 ? (
          <View>
            <Text style={styles.welcome}>Xin chào! Hỏi bất cứ điều gì về tiếng Nhật.</Text>
            <Text style={styles.hint}>Gợi ý:</Text>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.chip} onPress={() => send(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          messages.map((m, i) => (
            <View
              key={`${i}-${m.role}`}
              style={[styles.bubble, m.role === 'user' ? styles.user : styles.bot]}
            >
              <Text style={m.role === 'user' ? styles.userText : styles.botText}>{m.text}</Text>
            </View>
          ))
        )}
        {loading ? <ActivityIndicator style={{ marginVertical: 12 }} color="#1d4ed8" /> : null}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi về ngữ pháp, từ vựng..."
          value={input}
          onChangeText={setInput}
          editable={!loading}
          onSubmitEditing={() => send(input)}
        />
        <Pressable style={styles.send} onPress={() => send(input)} disabled={loading}>
          <Text style={styles.sendText}>Gửi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f3ef' },
  list: { padding: 16, paddingBottom: 24 },
  welcome: { fontSize: 16, marginBottom: 16, color: '#111827' },
  hint: { fontWeight: '700', marginBottom: 8, color: '#374151' },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  chipText: { fontSize: 13, color: '#1d4ed8' },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12, marginBottom: 8 },
  user: { alignSelf: 'flex-end', backgroundColor: '#1d4ed8' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  userText: { color: '#fff', lineHeight: 20 },
  botText: { color: '#111827', lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  send: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600' },
});
