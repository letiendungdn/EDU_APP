import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface NavCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function NavCard({ title, subtitle, onPress, style }: NavCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  pressed: { opacity: 0.85 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
