import Foundation

struct TranslateAPI {
    private let session: URLSession
    private static var cache: [String: String] = [:]

    init(session: URLSession = .shared) {
        self.session = session
    }

    func translateJapanese(_ text: String) async throws -> String {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return text }
        if let cached = Self.cache[trimmed] { return cached }

        guard let url = URL(string: "\(APIConfig.baseURL)/translate") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(
            url: url,
            method: "POST",
            jsonBody: ["text": trimmed, "from": "ja", "to": "vi"]
        )
        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.decodingFailed
        }
        var payload = json
        if let nested = HTTPClient.unwrapDataField(json) as? [String: Any] {
            payload = nested
        }
        let translated = (payload["translation"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
            ?? trimmed
        Self.cache[trimmed] = translated
        return translated
    }
}
