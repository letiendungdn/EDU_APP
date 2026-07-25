import Foundation
import SwiftData

enum SyncService {
    @MainActor
    static func enqueueSrsUpdate(
        card: SRSCard,
        modelContext: ModelContext
    ) {
        card.syncStatus = "pending"
        card.updatedAt = .now

        let payload: [String: Any] = [
            "vocabularyId": card.vocabulary?.id ?? 0,
            "easeFactor": card.easeFactor,
            "interval": card.interval,
            "repetitions": card.repetitions,
            "nextReviewAt": ISO8601DateFormatter().string(from: card.nextReviewAt),
            "mastered": card.mastered,
            "kana": card.vocabulary?.kana ?? "",
            "kanji": card.vocabulary?.kanji as Any,
            "meaning": card.vocabulary?.meaning ?? "",
            "lessonNumber": card.vocabulary?.lessonNumber ?? 0,
        ]
        let data = (try? JSONSerialization.data(withJSONObject: payload)) ?? Data()
        let json = String(data: data, encoding: .utf8) ?? "{}"
        let vocabId = card.vocabulary?.id ?? 0
        modelContext.insert(SyncQueueItem(
            operation: "UPDATE_SRS",
            entityId: vocabId,
            payload: json
        ))
        try? modelContext.save()
    }

    @MainActor
    static func flushPending(
        modelContext: ModelContext,
        isOnline: Bool,
        isLoggedIn: Bool
    ) async {
        guard isOnline, isLoggedIn else { return }

        let descriptor = FetchDescriptor<SyncQueueItem>(
            sortBy: [SortDescriptor(\.createdAt, order: .forward)]
        )
        guard let pending = try? modelContext.fetch(descriptor), !pending.isEmpty else { return }

        var reviewItems: [[String: Any]] = []
        for item in pending where item.operation == "UPDATE_SRS" {
            guard let data = item.payload.data(using: .utf8),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            else { continue }

            reviewItems.append([
                "kana": json["kana"] as? String ?? "",
                "kanji": json["kanji"] as? String as Any,
                "meaning": json["meaning"] as? String ?? "",
                "lessonNumber": json["lessonNumber"] as? Int ?? 0,
                "wrongCount": (json["repetitions"] as? Int ?? 1) == 0 ? 1 : 0,
                "reviewStreak": json["repetitions"] as? Int ?? 0,
            ])
        }

        do {
            try await ProgressAPI().syncReviewBank(items: reviewItems)

            let srsDescriptor = FetchDescriptor<SRSCard>()
            if let cards = try? modelContext.fetch(srsDescriptor) {
                for card in cards where card.syncStatus == "pending" {
                    card.syncStatus = "synced"
                }
            }
            for item in pending {
                modelContext.delete(item)
            }
            try? modelContext.save()
        } catch {
            // Giữ pending — thử lại khi có mạng lần sau
        }
    }
}
