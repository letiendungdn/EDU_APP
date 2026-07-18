import Foundation
import Security

enum TokenStore {
    private static let service = "com.edu.nihongo.ios"

    static func saveAccessToken(_ token: String) {
        write(token, account: "access_token")
    }

    static func saveRefreshToken(_ token: String) {
        write(token, account: "refresh_token")
    }

    static func accessToken() -> String? { read(account: "access_token") }
    static func refreshToken() -> String? { read(account: "refresh_token") }

    static func clear() {
        delete(account: "access_token")
        delete(account: "refresh_token")
    }

    static var isLoggedIn: Bool { accessToken() != nil }

    private static func write(_ token: String, account: String) {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary)
        var add = query
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        SecItemAdd(add as CFDictionary, nil)
    }

    private static func read(account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
              let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private static func delete(account: String) {
        SecItemDelete([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ] as CFDictionary)
    }
}
