import SwiftUI
import SwiftData

@main
struct NihongoEDUApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    private let modelContainer: ModelContainer = {
        let schema = Schema([Vocabulary.self, SRSCard.self])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("ModelContainer init failed: \(error)")
        }
    }()

    @State private var authState = AuthState()
    @State private var pushService = PushService()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environment(authState)
                .environment(pushService)
                .task { appDelegate.pushService = pushService }
                .onChange(of: authState.isLoggedIn) { _, loggedIn in
                    if loggedIn {
                        Task { await pushService.requestPermissionIfNeeded() }
                    }
                }
        }
        .modelContainer(modelContainer)
    }
}
