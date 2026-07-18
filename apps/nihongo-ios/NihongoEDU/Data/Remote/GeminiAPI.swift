import Foundation

struct SentenceFeedback: Sendable {
    var corrected: String
    var reading: String
    var meaning: String
    var explanation: String
    var examples: [String]
}

enum GeminiAPI {
    private static let endpoint = URL(
        string: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    )!

    private static let systemPrompt = """
        Bạn là gia sư tiếng Nhật. Phản hồi JSON thuần (không markdown): \
        {"corrected":"","reading":"","meaning":"","explanation":"","examples":[]}. \
        Nếu câu đúng, để corrected rỗng.
        """

    static func analyze(_ sentence: String, apiKey: String = APIConfig.geminiAPIKey) async throws -> SentenceFeedback {
        var url = endpoint
        url.append(queryItems: [URLQueryItem(name: "key", value: apiKey)])

        let body: [String: Any] = [
            "system_instruction": ["parts": [["text": systemPrompt]]],
            "contents": [["role": "user", "parts": [["text": sentence]]]],
            "generationConfig": ["temperature": 0.3, "maxOutputTokens": 512],
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)

        let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        let raw = (((json??["candidates"] as? [[String: Any]])?.first?["content"] as? [String: Any])?["parts"] as? [[String: Any]])?.first?["text"] as? String ?? ""

        let cleaned = stripFence(raw)
        let parsed = (try? JSONSerialization.jsonObject(with: Data(cleaned.utf8))) as? [String: Any] ?? [:]

        return SentenceFeedback(
            corrected:   parsed["corrected"]   as? String   ?? "",
            reading:     parsed["reading"]     as? String   ?? "",
            meaning:     parsed["meaning"]     as? String   ?? "",
            explanation: parsed["explanation"] as? String   ?? "",
            examples:    parsed["examples"]    as? [String] ?? []
        )
    }

    private static func stripFence(_ text: String) -> String {
        let pattern = #"^```(?:json)?\s*([\s\S]*?)\s*```$"#
        if let range = text.range(of: pattern, options: [.regularExpression, .anchored]) {
            let inner = text[range]
                .replacingOccurrences(of: #"^```(?:json)?\s*"#, with: "", options: .regularExpression)
                .replacingOccurrences(of: #"\s*```$"#, with: "", options: .regularExpression)
            return inner.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return text.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
