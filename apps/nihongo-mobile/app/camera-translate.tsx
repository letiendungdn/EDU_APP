import TextRecognition from '@react-native-ml-kit/text-recognition';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { translateJapanese } from '../src/data/api';
import type { OverlayLabel } from '../src/domain/entities';
import { mapOcrFrameToView } from '../src/utils/overlay';

export default function CameraTranslateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [labels, setLabels] = useState<OverlayLabel[]>([]);
  const [paused, setPaused] = useState(false);
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });
  const processingRef = useRef(false);
  const lastScanRef = useRef(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const scanFrame = useCallback(async () => {
    if (paused || processingRef.current || !cameraRef.current) return;

    const now = Date.now();
    if (now - lastScanRef.current < 900) return;

    processingRef.current = true;
    lastScanRef.current = now;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.25,
        shutterSound: false,
        skipProcessing: true,
      });

      if (!photo?.uri) return;

      const imageW = photo.width ?? viewSize.width;
      const imageH = photo.height ?? viewSize.height;

      const result = await TextRecognition.recognize(photo.uri);
      const lines = result.blocks
        .flatMap((block) => block.lines)
        .filter((line) => line.text.trim().length > 0)
        .slice(0, 8);

      if (lines.length === 0) {
        setLabels([]);
        return;
      }

      const nextLabels: OverlayLabel[] = [];
      for (const line of lines) {
        const frame = line.frame;
        if (!frame || frame.width < 8 || frame.height < 8) continue;

        let translated: string;
        try {
          translated = await translateJapanese(line.text);
        } catch {
          translated = line.text;
        }

        const mapped = mapOcrFrameToView(
          frame,
          imageW,
          imageH,
          viewSize.width,
          viewSize.height,
        );

        nextLabels.push({
          ...mapped,
          original: line.text,
          translated,
        });
      }

      setLabels(nextLabels);
    } catch {
      // bỏ qua frame lỗi
    } finally {
      processingRef.current = false;
    }
  }, [paused, viewSize.height, viewSize.width]);

  useEffect(() => {
    if (!permission?.granted || paused) return;

    const timer = setInterval(() => {
      void scanFrame();
    }, 950);

    return () => clearInterval(timer);
  }, [permission?.granted, paused, scanFrame]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewSize({ width, height });
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Cần quyền camera để dịch trực tiếp.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Cấp quyền</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {labels.map((label, index) => (
        <View
          key={`${label.original}-${index}`}
          style={[
            styles.overlay,
            {
              left: label.left,
              top: label.top,
              maxWidth: Math.min(label.width, viewSize.width * 0.9),
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.overlayText}>{label.translated}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Pressable
          style={styles.pauseBtn}
          onPress={() => {
            setPaused((p) => !p);
            if (!paused) setLabels([]);
          }}
        >
          <Text style={styles.pauseBtnText}>{paused ? 'Tiếp tục' : 'Tạm dừng'}</Text>
        </Pressable>
        <Text style={styles.hint}>
          {paused
            ? 'Đã tạm dừng'
            : 'Hướng camera vào chữ tiếng Nhật — dịch hiện trên khung hình (cần mạng).'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: { color: '#fff', textAlign: 'center', marginBottom: 16 },
  btn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600' },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(29, 78, 216, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  overlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 12,
    gap: 8,
  },
  pauseBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pauseBtnText: { color: '#fff', fontWeight: '600' },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center' },
});
