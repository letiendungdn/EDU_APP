import Foundation

enum APIError: LocalizedError {
    case invalidURL, badStatus(Int), decodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL:         "URL không hợp lệ"
        case .badStatus(let c):   "Server lỗi \(c)"
        case .decodingFailed:     "Không đọc được dữ liệu"
        }
    }
}

struct VocabAPI {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func fetchPage(lessonNumber: Int, page: Int, limit: Int = 100) async throws -> [[String: Any]] {
        guard var components = URLComponents(string: "\(APIConfig.baseURL)/vocabularies") else {
            throw APIError.invalidURL
        }
        components.queryItems = [
            URLQueryItem(name: "lessonNumber", value: "\(lessonNumber)"),
            URLQueryItem(name: "page",         value: "\(page)"),
            URLQueryItem(name: "limit",        value: "\(limit)"),
        ]
        guard let url = components.url else { throw APIError.invalidURL }

        let (data, response) = try await session.data(from: url)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }

        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return []
        }

        // Unwrap { data: { data: [...] } } or { data: [...] }
        var field = json["data"]
        if let nested = field as? [String: Any] { field = nested["data"] }
        return (field as? [[String: Any]]) ?? []
    }

    func fetchAll(lessonNumber: Int) async throws -> [[String: Any]] {
        var all: [[String: Any]] = []
        var page = 1
        while true {
            let batch = try await fetchPage(lessonNumber: lessonNumber, page: page)
            all.append(contentsOf: batch)
            if batch.count < 100 { break }
            page += 1
        }
        return all
    }
}
