import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
import {CREATE_TABLES} from './schema';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabase({name: 'nihongo.db', location: 'default'});
  await db.executeSql(CREATE_TABLES);
  return db;
}

export async function closeDB() {
  if (db) {
    await db.close();
    db = null;
  }
}
