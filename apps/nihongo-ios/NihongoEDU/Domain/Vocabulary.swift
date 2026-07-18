import SwiftData
import Foundation

@Model
final class Vocabulary {
    @Attribute(.unique) var id: Int
    var lessonNumber: Int
    var kana: String
    var kanji: String?
    var meaning: String
    var romaji: String
    var sortOrder: Int
    var updatedAt: Date

    @Relationship(deleteRule: .cascade, inverse: \SRSCard.vocabulary)
    var srsCard: SRSCard?

    init(
        id: Int,
        lessonNumber: Int,
        kana: String,
        kanji: String? = nil,
        meaning: String,
        romaji: String = "",
        sortOrder: Int = 0
    ) {
        self.id = id
        self.lessonNumber = lessonNumber
        self.kana = kana
        self.kanji = kanji
        self.meaning = meaning
        self.romaji = romaji
        self.sortOrder = sortOrder
        self.updatedAt = .now
    }
}
