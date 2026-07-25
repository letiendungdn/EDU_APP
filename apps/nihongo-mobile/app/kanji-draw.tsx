import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { speakJapanese } from '../src/utils/tts';

type Point = { x: number; y: number };
type Stroke = Point[];

function pointsToPath(stroke: Stroke): string {
  if (stroke.length === 0) return '';
  return stroke
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

export default function KanjiDrawScreen() {
  const params = useLocalSearchParams<{ kanji?: string; kana?: string }>();
  const kanji = params.kanji || '行';
  const kana = params.kana || 'いく';
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const currentRef = useRef<Stroke>([]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          currentRef.current = [{ x: locationX, y: locationY }];
          setCurrent(currentRef.current);
          setSubmitted(false);
        },
        onPanResponderMove: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          currentRef.current = [...currentRef.current, { x: locationX, y: locationY }];
          setCurrent(currentRef.current);
        },
        onPanResponderRelease: () => {
          if (currentRef.current.length > 2) {
            setStrokes((prev) => [...prev, currentRef.current]);
          }
          currentRef.current = [];
          setCurrent([]);
        },
      }),
    [],
  );

  const clear = () => {
    setStrokes([]);
    setCurrent([]);
    setSubmitted(false);
  };

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    setSubmitted(false);
  };

  const submit = () => {
    if (strokes.length === 0) return;
    const totalPoints = strokes.reduce((sum, s) => sum + s.length, 0);
    const ok = totalPoints > 20;
    setSubmitted(true);
    setCorrect(ok);
    if (ok) void speakJapanese(kana);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.kanji}>{kanji}</Text>
      <Text style={styles.kana}>（{kana}）</Text>
      <Text style={styles.hint}>Hãy vẽ chữ trên ô bên dưới</Text>

      <View style={[styles.canvas, submitted && (correct ? styles.ok : styles.bad)]} {...pan.panHandlers}>
        <Text style={styles.ghost}>{kanji}</Text>
        <Svg style={StyleSheet.absoluteFill}>
          <Line x1="50%" y1="0" x2="50%" y2="100%" stroke="#d1d5db" strokeDasharray="6 4" />
          <Line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d1d5db" strokeDasharray="6 4" />
          {[...strokes, current].map((stroke, i) => (
            <Path
              key={i}
              d={pointsToPath(stroke)}
              stroke="#1d4ed8"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>

      {submitted ? (
        <Text style={[styles.feedback, { color: correct ? '#16a34a' : '#dc2626' }]}>
          {correct ? 'Tốt lắm! Tiếp tục luyện tập nhé' : 'Chưa đủ nét — hãy thử lại!'}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Pressable style={styles.outline} onPress={undo}>
          <Text>Undo</Text>
        </Pressable>
        <Pressable style={styles.outline} onPress={clear}>
          <Text>Xóa</Text>
        </Pressable>
        <Pressable style={styles.filled} onPress={submit}>
          <Text style={styles.filledText}>Kiểm tra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#f5f3ef' },
  kanji: { fontSize: 56, fontWeight: '700', textAlign: 'center', color: '#1d4ed8' },
  kana: { textAlign: 'center', fontSize: 18, color: '#6b7280', marginBottom: 8 },
  hint: { textAlign: 'center', color: '#6b7280', marginBottom: 12 },
  canvas: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  ok: { borderColor: '#16a34a' },
  bad: { borderColor: '#dc2626' },
  ghost: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    fontSize: 140,
    color: 'rgba(0,0,0,0.06)',
    fontWeight: '700',
  },
  feedback: { textAlign: 'center', marginTop: 12, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  outline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  filled: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  filledText: { color: '#fff', fontWeight: '600' },
});
