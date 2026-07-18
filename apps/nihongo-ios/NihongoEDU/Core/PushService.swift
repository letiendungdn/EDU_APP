import Foundation
import Observation
import UIKit
import UserNotifications

@Observable
final class PushService: NSObject, UNUserNotificationCenterDelegate {
    private(set) var deviceToken: String?

    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    /// Ask for permission only if the user hasn't decided yet.
    /// Call this once after the user logs in.
    func requestPermissionIfNeeded() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .notDetermined else { return }

        let granted = (try? await center.requestAuthorization(options: [.alert, .badge, .sound])) ?? false
        if granted {
            await MainActor.run { UIApplication.shared.registerForRemoteNotifications() }
        }
    }

    /// Called by AppDelegate when APNs returns a device token.
    func setDeviceToken(_ data: Data) {
        deviceToken = data.map { String(format: "%02x", $0) }.joined()
        Task { await registerWithBackend() }
    }

    private func registerWithBackend() async {
        guard let token = deviceToken,
              let accessToken = TokenStore.accessToken(),
              let url = URL(string: "\(APIConfig.baseURL)/push/register") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        req.httpBody = try? JSONEncoder().encode(["token": token, "platform": "ios"])
        _ = try? await URLSession.shared.data(for: req)
    }

    func unregisterFromBackend() async {
        guard let token = deviceToken,
              let accessToken = TokenStore.accessToken(),
              let url = URL(string: "\(APIConfig.baseURL)/push/unregister") else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "DELETE"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        req.httpBody = try? JSONEncoder().encode(["token": token])
        _ = try? await URLSession.shared.data(for: req)
        deviceToken = nil
    }

    // MARK: - UNUserNotificationCenterDelegate

    // Show notification banner even when app is in foreground
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .badge, .sound])
    }

    // Deep-link handling: payload { screen: "srs" } navigates to SRS tab
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        if let screen = userInfo["screen"] as? String, screen == "srs" {
            NotificationCenter.default.post(name: .navigateToSRS, object: nil)
        }
        completionHandler()
    }
}

extension Notification.Name {
    static let navigateToSRS = Notification.Name("navigateToSRS")
}
