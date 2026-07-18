import Foundation

struct AuthAPI {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func login(email: String, password: String) async throws {
        try await postAuth(
            path: "/auth/login",
            body: ["email": email, "password": password]
        )
    }

    func loginOidc(accessToken: String, idToken: String?, refreshToken: String? = nil) async throws {
        var body: [String: Any] = ["accessToken": accessToken]
        if let idToken, !idToken.isEmpty { body["idToken"] = idToken }
        try await postAuth(path: "/auth/oidc", body: body)
        if let refreshToken, !refreshToken.isEmpty {
            TokenStore.saveRefreshToken(refreshToken)
        }
    }

    func logout() async {
        defer { TokenStore.clear() }
        guard let token = TokenStore.accessToken(),
              let url = URL(string: "\(APIConfig.baseURL)/auth/logout") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        _ = try? await session.data(for: req)
    }

    private func postAuth(path: String, body: [String: Any]) async throws {
        guard let url = URL(string: "\(APIConfig.baseURL)\(path)") else {
            throw APIError.invalidURL
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }

        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let token = Self.extractAccessToken(json) else {
            throw APIError.decodingFailed
        }
        TokenStore.saveAccessToken(token)
    }

    private static func extractAccessToken(_ json: [String: Any]) -> String? {
        if let nested = json["data"] as? [String: Any],
           let token = nested["access_token"] as? String, !token.isEmpty {
            return token
        }
        if let token = json["access_token"] as? String, !token.isEmpty {
            return token
        }
        return nil
    }
}
