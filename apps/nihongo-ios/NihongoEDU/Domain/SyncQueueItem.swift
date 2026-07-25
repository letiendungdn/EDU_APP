import Foundation
import SwiftData

@Model
final class SyncQueueItem {
    var id: UUID
    var operation: String
    var entityId: Int
    var payload: String
    var createdAt: Date

    init(operation: String, entityId: Int, payload: String) {
        self.id = UUID()
        self.operation = operation
        self.entityId = entityId
        self.payload = payload
        self.createdAt = .now
    }
}
