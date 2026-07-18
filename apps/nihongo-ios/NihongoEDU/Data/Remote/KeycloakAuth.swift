import AuthenticationServices
import CryptoKit
import Foundation
import UIKit

struct KeycloakTokens {
    let accessToken: String
    let idToken: String?
    let refreshToken: String?
}

enum KeycloakAuthError: LocalizedError {
    case cancelled, noCode, noAccessToken, badStatus(Int), invalidURL, cryptoFailure

    var errorDescription: String? {
        switch self {
        case .cancelled:        "Đã hủy đăng nhập Keycloak"
        case .noCode:           "Keycloak không trả authorization code"
        case .noAccessToken:    "Keycloak không trả access_token"
        case .badStatus(let c): "Token endpoint lỗi \(c)"
        case .invalidURL:       "URL Keycloak không hợp lệ"
        case .cryptoFailure:    "Không tạo được PKCE verifier (lỗi entropy)"
        }
    }
}

/// OIDC Authorization Code + PKCE via ASWebAuthenticationSession.
@MainActor
final class KeycloakAuth: NSObject, ASWebAuthenticationPresentationContextProviding {
    /// Must retain until the callback fires or the session is cancelled.
    private var webAuthSession: ASWebAuthenticationSession?

    func login() async throws -> KeycloakTokens {
        let verifier = try Self.randomVerifier()
        let challenge = Self.s256Challenge(verifier)

        guard var components = URLComponents(string: KeycloakConfig.authorizationEndpoint) else {
            throw KeycloakAuthError.invalidURL
        }
        components.queryItems = [
            URLQueryItem(name: "client_id", value: KeycloakConfig.clientId),
            URLQueryItem(name: "redirect_uri", value: KeycloakConfig.redirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid profile email"),
            URLQueryItem(name: "code_challenge", value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "prompt", value: "login"),
        ]
        guard let authURL = components.url else { throw KeycloakAuthError.invalidURL }

        let callbackURL = try await startSession(url: authURL)
        guard let items = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?.queryItems,
              let code = items.first(where: { $0.name == "code" })?.value else {
            throw KeycloakAuthError.noCode
        }

        return try await exchangeCode(code, verifier: verifier)
    }

    private func startSession(url: URL) async throws -> URL {
        try await withCheckedThrowingContinuation { cont in
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: KeycloakConfig.callbackScheme
            ) { [weak self] callbackURL, error in
                self?.webAuthSession = nil
                if let error {
                    let ns = error as NSError
                    if ns.domain == ASWebAuthenticationSessionError.errorDomain,
                       ns.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        cont.resume(throwing: KeycloakAuthError.cancelled)
                    } else {
                        cont.resume(throwing: error)
                    }
                    return
                }
                guard let callbackURL else {
                    cont.resume(throwing: KeycloakAuthError.cancelled)
                    return
                }
                cont.resume(returning: callbackURL)
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = true
            self.webAuthSession = session
            if !session.start() {
                self.webAuthSession = nil
                cont.resume(throwing: KeycloakAuthError.invalidURL)
            }
        }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .compactMap { $0.keyWindow }
            .first ?? ASPresentationAnchor()
    }

    private func exchangeCode(_ code: String, verifier: String) async throws -> KeycloakTokens {
        guard let url = URL(string: KeycloakConfig.tokenEndpoint) else {
            throw KeycloakAuthError.invalidURL
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body: [String: String] = [
            "grant_type": "authorization_code",
            "client_id": KeycloakConfig.clientId,
            "code": code,
            "redirect_uri": KeycloakConfig.redirectURI,
            "code_verifier": verifier,
        ]
        req.httpBody = body
            .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
            .joined(separator: "&")
            .data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw KeycloakAuthError.badStatus(http.statusCode)
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let access = json["access_token"] as? String, !access.isEmpty else {
            throw KeycloakAuthError.noAccessToken
        }
        return KeycloakTokens(
            accessToken: access,
            idToken: json["id_token"] as? String,
            refreshToken: json["refresh_token"] as? String
        )
    }

    private static func randomVerifier() throws -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else {
            throw KeycloakAuthError.cryptoFailure
        }
        return Data(bytes).base64URLEncodedString()
    }

    private static func s256Challenge(_ verifier: String) -> String {
        let digest = SHA256.hash(data: Data(verifier.utf8))
        return Data(digest).base64URLEncodedString()
    }
}

private extension Data {
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
