package com.edu.nihongo.utils

import com.edu.nihongo.domain.entity.SrsCard
import com.edu.nihongo.domain.entity.SyncStatus
import kotlin.math.roundToInt

object SrsAlgorithm {
    fun calculateNextReview(card: SrsCard, quality: Int): SrsCard {
        val q = quality.coerceIn(0, 5)
        var ease = card.easeFactor
        var interval = card.interval
        var reps = card.repetitions

        if (q < 3) {
            reps = 0
            interval = 1
        } else {
            interval = when (reps) {
                0 -> 1
                1 -> 6
                else -> (interval * ease).roundToInt().coerceIn(1, 3650)
            }
            reps += 1
        }

        ease += 0.1f - (5 - q) * (0.08f + (5 - q) * 0.02f)
        if (ease < 1.3f) ease = 1.3f

        val nextReviewAt = System.currentTimeMillis() + interval * 86_400_000L
        val mastered = reps >= 5 && interval >= 21

        return card.copy(
            easeFactor = ease,
            interval = interval,
            repetitions = reps,
            nextReviewAt = nextReviewAt,
            mastered = mastered,
            syncStatus = SyncStatus.PENDING,
            updatedAt = System.currentTimeMillis(),
        )
    }
}
