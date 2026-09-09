import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useVocabList} from '../hooks/useVocab';
import type {Vocab, RootStackParamList} from '../types';

const LEVELS = ['all', 'N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_COLOR: Record<string, string> = {
  N5: '#22c55e',
  N4: '#3b82f6',
  N3: '#f59e0b',
  N2: '#ef4444',
  N1: '#8b5cf6',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function VocabScreen() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [search, setSearch] = useState('');
  const nav = useNavigation<Nav>();

  const {data, isLoading, isError, refetch} = useVocabList(
    selectedLevel === 'all' ? undefined : selectedLevel,
  );

  const items = (data?.items ?? []).filter(
    v =>
      !search ||
      v.word.includes(search) ||
      v.reading.includes(search) ||
      v.meaning.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm từ vựng..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Level filter */}
      <View style={styles.filterRow}>
        {LEVELS.map(lv => (
          <Pressable
            key={lv}
            style={[styles.chip, selectedLevel === lv && styles.chipActive]}
            onPress={() => setSelectedLevel(lv)}>
            <Text
              style={[
                styles.chipText,
                selectedLevel === lv && styles.chipTextActive,
              ]}>
              {lv.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{flex: 1}} color="#dc2626" size="large" />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Lỗi tải dữ liệu</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={items}
          estimatedItemSize={72}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <VocabItem
              item={item}
              onPress={() =>
                nav.navigate('VocabDetail', {id: item.id, word: item.word})
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Không có từ nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const VocabItem = React.memo(
  ({item, onPress}: {item: Vocab; onPress: () => void}) => {
    const color = LEVEL_COLOR[item.level] ?? '#6b7280';
    return (
      <Pressable
        style={({pressed}) => [styles.item, pressed && styles.itemPressed]}
        onPress={onPress}>
        <View style={[styles.levelDot, {backgroundColor: color}]} />
        <View style={styles.itemBody}>
          <Text style={styles.word}>{item.word}</Text>
          <Text style={styles.reading}>{item.reading}</Text>
        </View>
        <Text style={styles.meaning} numberOfLines={1}>
          {item.meaning}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f3ef'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  searchBar: {padding: 12, paddingBottom: 0},
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {backgroundColor: '#dc2626', borderColor: '#dc2626'},
  chipText: {fontSize: 12, fontWeight: '600', color: '#374151'},
  chipTextActive: {color: '#fff'},
  list: {paddingHorizontal: 12, paddingBottom: 32},
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemPressed: {opacity: 0.8},
  levelDot: {width: 10, height: 10, borderRadius: 5},
  itemBody: {flex: 1},
  word: {fontSize: 17, fontWeight: '700', color: '#111827'},
  reading: {fontSize: 12, color: '#6b7280', marginTop: 1},
  meaning: {fontSize: 13, color: '#374151', maxWidth: 120},
  errorText: {color: '#dc2626', fontSize: 14, marginBottom: 8},
  retryText: {color: '#1a6fb5', fontSize: 14},
  emptyText: {color: '#6b7280', fontSize: 14},
});
