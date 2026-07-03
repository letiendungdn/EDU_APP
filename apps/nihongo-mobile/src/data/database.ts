import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY NOT NULL,
      lesson_number INTEGER NOT NULL,
      kana TEXT NOT NULL,
      kanji TEXT,
      meaning TEXT NOT NULL,
      romaji TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON vocabulary(lesson_number);

    CREATE TABLE IF NOT EXISTS srs_card (
      id INTEGER PRIMARY KEY NOT NULL,
      vocabulary_id INTEGER NOT NULL,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      interval INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review_at INTEGER NOT NULL,
      mastered INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_srs_next ON srs_card(next_review_at);

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      payload TEXT NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('edu_app.db');
      await initSchema(db);
      return db;
    })();
  }
  return dbPromise;
}
