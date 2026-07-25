import Foundation

struct AiTutorAPI {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func ask(question: String, history: [[String: String]], context: String? = nil) async throws -> String {
        guard let url = URL(string: "\(APIConfig.baseURL)/ai/chat") else {
            throw APIError.invalidURL
        }
        var body: [String: Any] = [
            "question": question,
            "history": history,
        ]
        if let context, !context.isEmpty {
            body["context"] = context
        }
        let req = try HTTPClient.authorizedRequest(url: url, method: "POST", jsonBody: body)
        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return (json?["answer"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }
}
