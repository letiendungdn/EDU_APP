import Foundation

struct ProgressAPI {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    /// Đồng bộ review bank lên server (giống Flutter syncReviewBank).
    func syncReviewBank(items: [[String: Any]]) async throws {
        guard !items.isEmpty else { return }
        guard let url = URL(string: "\(APIConfig.baseURL)/progress/review") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(
            url: url,
            method: "POST",
            jsonBody: ["items": items]
        )
        let (_, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
    }
}
