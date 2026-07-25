package com.edu.nihongo.utils

import com.edu.nihongo.domain.entity.SrsCard
import com.edu.nihongo.domain.entity.SyncStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SrsAlgorithmTest {
    private fun card(
        easeFactor: Float = 2.5f,
        interval: Int = 0,
        repetitions: Int = 0,
        mastered: Boolean = false,
    ) = SrsCard(
        id = 1L,
        vocabularyId = 10L,
        easeFactor = easeFactor,
        interval = interval,
        repetitions = repetitions,
        nextReviewAt = System.currentTimeMillis(),
        mastered = mastered,
        syncStatus = SyncStatus.SYNCED,
        updatedAt = System.currentTimeMillis(),
    )

    @Test
    fun qualityBelowThree_resetsRepetitionsAndInterval() {
        val next = SrsAlgorithm.calculateNextReview(
            card(repetitions = 4, interval = 15),
            quality = 2,
        )
        assertEquals(0, next.repetitions)
        assertEquals(1, next.interval)
        assertFalse(next.mastered)
        assertEquals(SyncStatus.PENDING, next.syncStatus)
    }

    @Test
    fun clampsNegativeQualityAsAgain() {
        val next = SrsAlgorithm.calculateNextReview(
            card(repetitions = 3, interval = 10),
            quality = -2,
        )
        assertEquals(0, next.repetitions)
        assertEquals(1, next.interval)
    }

    @Test
    fun firstSuccess_usesIntervalOne() {
        val next = SrsAlgorithm.calculateNextReview(card(), quality = 4)
        assertEquals(1, next.repetitions)
        assertEquals(1, next.interval)
    }

    @Test
    fun secondSuccess_usesIntervalSix() {
        val next = SrsAlgorithm.calculateNextReview(
            card(repetitions = 1, interval = 1),
            quality = 4,
        )
        assertEquals(2, next.repetitions)
        assertEquals(6, next.interval)
    }

    @Test
    fun laterSuccess_multipliesByEase() {
        val next = SrsAlgorithm.calculateNextReview(
            card(repetitions = 2, interval = 6, easeFactor = 2.5f),
            quality = 4,
        )
        assertEquals(3, next.repetitions)
        assertEquals(15, next.interval)
    }

    @Test
    fun easeFactor_neverBelowMinimum() {
        val next = SrsAlgorithm.calculateNextReview(
            card(easeFactor = 1.3f),
            quality = 0,
        )
        assertTrue(next.easeFactor >= 1.3f)
    }

    @Test
    fun mastered_whenRepsAndIntervalMeetThreshold() {
        val next = SrsAlgorithm.calculateNextReview(
            card(repetitions = 4, interval = 21, easeFactor = 2.5f),
            quality = 5,
        )
        assertEquals(5, next.repetitions)
        assertTrue(next.interval >= 21)
        assertTrue(next.mastered)
    }

    @Test
    fun nextReviewAt_isAboutIntervalDaysAhead() {
        val before = System.currentTimeMillis()
        val next = SrsAlgorithm.calculateNextReview(card(), quality = 4)
        val dayMs = 86_400_000L
        assertTrue(next.nextReviewAt >= before + dayMs - 5_000)
        assertTrue(next.nextReviewAt <= System.currentTimeMillis() + dayMs + 5_000)
    }
}
