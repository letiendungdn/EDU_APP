import SwiftData
import Foundation

@Model
final class SRSCard {
    var easeFactor: Double
    var interval: Int
    var repetitions: Int
    var nextReviewAt: Date
    var mastered: Bool
    var updatedAt: Date
    /// synced | pending | conflict — parity với Android/Expo/Flutter
    var syncStatus: String

    var vocabulary: Vocabulary?

    init() {
        easeFactor = 2.5
        interval = 0
        repetitions = 0
        nextReviewAt = .now
        mastered = false
        updatedAt = .now
        syncStatus = "synced"
    }
}
