import SwiftUI
import SwiftData

@main
struct NihongoEDUApp: App {
    private let modelContainer: ModelContainer = {
        let schema = Schema([Vocabulary.self, SRSCard.self])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("ModelContainer init failed: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            HomeView()
        }
        .modelContainer(modelContainer)
    }
}
