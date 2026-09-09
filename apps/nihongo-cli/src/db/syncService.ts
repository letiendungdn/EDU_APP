import {gqlClient, GET_VOCAB_LIST, SUBMIT_SRS} from '../api/graphqlClient';
import {upsertVocab, flushSyncQueue} from './vocabRepo';
import type {Vocab} from '../types';

// Sync vocab từ GraphQL server → SQLite local
export async function syncVocabFromServer(): Promise<void> {
  try {
    const {data} = await gqlClient.query({
      query: GET_VOCAB_LIST,
      variables: {limit: 500},
      fetchPolicy: 'network-only',
    });
    const items: Vocab[] = data.vocabList.items;
    await upsertVocab(items);
  } catch (e) {
    // Offline — bỏ qua, dùng data local
    console.log('Sync skipped (offline):', e);
  }
}

// Flush pending SRS reviews lên server
export async function syncPendingSrs(): Promise<void> {
  await flushSyncQueue(async (vocabId, quality) => {
    await gqlClient.mutate({
      mutation: SUBMIT_SRS,
      variables: {vocabId, quality},
    });
  });
}
