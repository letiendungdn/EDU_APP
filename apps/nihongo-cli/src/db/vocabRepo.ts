import {getDB} from './database';
import type {Vocab} from '../types';

// Upsert vocab list từ server vào SQLite
export async function upsertVocab(items: Vocab[]): Promise<void> {
  const db = await getDB();
  await db.transaction(tx => {
    for (const v of items) {
      tx.executeSql(
        `INSERT OR REPLACE INTO vocab
          (id, word, reading, meaning, level, srs_interval, srs_due, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.word, v.reading, v.meaning, v.level, v.srsInterval, v.srsDue, new Date().toISOString()],
      );
    }
  });
}

// Đọc vocab từ local (offline)
export async function getLocalVocab(level?: string): Promise<Vocab[]> {
  const db = await getDB();
  const query = level
    ? 'SELECT * FROM vocab WHERE level = ? ORDER BY id'
    : 'SELECT * FROM vocab ORDER BY id';
  const [result] = await db.executeSql(query, level ? [level] : []);
  return rowsToVocab(result);
}

// Lấy thẻ SRS đến hạn hôm nay
export async function getDueCards(): Promise<Vocab[]> {
  const db = await getDB();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [result] = await db.executeSql(
    `SELECT * FROM vocab
     WHERE srs_due IS NULL OR srs_due <= ?
     ORDER BY srs_due ASC
     LIMIT 50`,
    [today],
  );
  return rowsToVocab(result);
}

// Cập nhật SRS sau khi review
export async function updateSrs(
  vocabId: number,
  newInterval: number,
  nextDue: string,
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'UPDATE vocab SET srs_interval = ?, srs_due = ? WHERE id = ?',
    [newInterval, nextDue, vocabId],
  );
  // Ghi log
  await db.executeSql(
    'INSERT INTO srs_log (vocab_id, quality, reviewed_at) VALUES (?, ?, ?)',
    [vocabId, newInterval, new Date().toISOString()],
  );
}

// Đưa SRS result vào queue khi offline
export async function enqueueSrsSync(vocabId: number, quality: number): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'INSERT INTO sync_queue (action, payload, created_at) VALUES (?, ?, ?)',
    ['SRS_SUBMIT', JSON.stringify({vocabId, quality}), new Date().toISOString()],
  );
}

// Flush sync queue khi có mạng
export async function flushSyncQueue(
  submitFn: (vocabId: number, quality: number) => Promise<void>,
): Promise<void> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM sync_queue WHERE retries < 3 ORDER BY created_at',
    [],
  );
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    const {vocabId, quality} = JSON.parse(row.payload);
    try {
      await submitFn(vocabId, quality);
      await db.executeSql('DELETE FROM sync_queue WHERE id = ?', [row.id]);
    } catch {
      await db.executeSql('UPDATE sync_queue SET retries = retries + 1 WHERE id = ?', [row.id]);
    }
  }
}

function rowsToVocab(result: any): Vocab[] {
  const items: Vocab[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const r = result.rows.item(i);
    items.push({
      id: r.id,
      word: r.word,
      reading: r.reading,
      meaning: r.meaning,
      level: r.level,
      srsInterval: r.srs_interval,
      srsDue: r.srs_due,
    });
  }
  return items;
}
