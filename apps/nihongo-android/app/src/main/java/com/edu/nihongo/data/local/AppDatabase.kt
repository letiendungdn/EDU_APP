package com.edu.nihongo.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.edu.nihongo.data.local.dao.SrsCardDao
import com.edu.nihongo.data.local.dao.SyncQueueDao
import com.edu.nihongo.data.local.dao.VocabularyDao
import com.edu.nihongo.data.local.entity.SrsCardEntity
import com.edu.nihongo.data.local.entity.SyncQueueEntity
import com.edu.nihongo.data.local.entity.VocabularyEntity

@Database(
    entities = [
        VocabularyEntity::class,
        SrsCardEntity::class,
        SyncQueueEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun vocabDao(): VocabularyDao
    abstract fun srsDao(): SrsCardDao
    abstract fun syncQueueDao(): SyncQueueDao

    companion object {
        const val DB_NAME = "edu_app.db"
    }
}
