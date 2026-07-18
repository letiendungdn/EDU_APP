import Foundation

enum KeycloakConfig {
    static let url: String = {
        if let override = ProcessInfo.processInfo.environment["KEYCLOAK_URL"], !override.isEmpty {
            return override.hasSuffix("/") ? String(override.dropLast()) : override
        }
        #if targetEnvironment(simulator)
        return "http://localhost:8080"
        #else
        return "http://192.168.1.100:8080"
        #endif
    }()

    static let realm: String =
        ProcessInfo.processInfo.environment["KEYCLOAK_REALM"] ?? "edu-app"

    static let clientId: String =
        ProcessInfo.processInfo.environment["KEYCLOAK_CLIENT_ID"] ?? "nihongo-mobile"

    static var authority: String { "\(url)/realms/\(realm)" }

    static var authorizationEndpoint: String {
        "\(authority)/protocol/openid-connect/auth"
    }

    static var tokenEndpoint: String {
        "\(authority)/protocol/openid-connect/token"
    }

    /// Must match realm client redirect + CFBundleURLSchemes
    static let redirectURI = "com.edu.nihongo.ios:/oauth2redirect"
    static let callbackScheme = "com.edu.nihongo.ios"
}
