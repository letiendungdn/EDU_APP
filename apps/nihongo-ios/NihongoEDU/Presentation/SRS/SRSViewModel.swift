import SwiftUI
import SwiftData

@Observable
@MainActor
final class SRSViewModel {
    var sessionTotal: Int = 0
    var sessionCorrect: Int = 0
    var showAnswer: Bool = false

    func rate(_ quality: Int, card: SRSCard, modelContext: ModelContext) {
        sessionTotal += 1
        if quality >= 3 { sessionCorrect += 1 }

        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: card.easeFactor,
            interval: card.interval,
            repetitions: card.repetitions,
            quality: quality
        )

        card.easeFactor   = result.easeFactor
        card.interval     = result.interval
        card.repetitions  = result.repetitions
        card.nextReviewAt = result.nextReviewAt
        card.mastered     = result.mastered
        card.updatedAt    = .now

        try? modelContext.save()
        showAnswer = false
    }

    func reset() {
        sessionTotal = 0
        sessionCorrect = 0
        showAnswer = false
    }
}
