import Foundation

struct LiveSessionSummary: Identifiable, Hashable {
    let id: Int
    let title: String
    let roomName: String
    let status: String
    let coachName: String?
}

struct LiveJoinResponse: Hashable {
    let sessionId: Int
    let token: String
    let wsUrl: String
    let roomName: String
    let title: String?
}

struct LiveAPI {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func listSessions() async throws -> [LiveSessionSummary] {
        guard let url = URL(string: "\(APIConfig.baseURL)/live/sessions") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(url: url)
        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
        let root = try JSONSerialization.jsonObject(with: data)
        let list: [[String: Any]]
        if let arr = root as? [[String: Any]] {
            list = arr
        } else if let obj = root as? [String: Any],
                  let unwrapped = HTTPClient.unwrapDataField(obj) as? [[String: Any]] {
            list = unwrapped
        } else if let obj = root as? [String: Any],
                  let dataArr = obj["data"] as? [[String: Any]] {
            list = dataArr
        } else {
            list = []
        }
        return list.compactMap { mapSession($0) }
    }

    func createSession(title: String) async throws -> LiveJoinResponse {
        guard let url = URL(string: "\(APIConfig.baseURL)/live/sessions") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(
            url: url,
            method: "POST",
            jsonBody: ["title": title]
        )
        return try await decodeJoin(req)
    }

    func joinSession(id: Int) async throws -> LiveJoinResponse {
        guard let url = URL(string: "\(APIConfig.baseURL)/live/sessions/\(id)/join") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(url: url, method: "POST", jsonBody: [:])
        return try await decodeJoin(req)
    }

    func endSession(id: Int) async throws {
        guard let url = URL(string: "\(APIConfig.baseURL)/live/sessions/\(id)") else {
            throw APIError.invalidURL
        }
        let req = try HTTPClient.authorizedRequest(url: url, method: "DELETE")
        let (_, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
    }

    private func decodeJoin(_ req: URLRequest) async throws -> LiveJoinResponse {
        let (data, response) = try await session.data(for: req)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.decodingFailed
        }
        let payload = (HTTPClient.unwrapDataField(json) as? [String: Any]) ?? json
        guard let sessionId = payload["sessionId"] as? Int,
              let token = payload["token"] as? String,
              let wsUrl = payload["wsUrl"] as? String else {
            throw APIError.decodingFailed
        }
        return LiveJoinResponse(
            sessionId: sessionId,
            token: token,
            wsUrl: wsUrl,
            roomName: payload["roomName"] as? String ?? "",
            title: payload["title"] as? String
        )
    }

    private func mapSession(_ json: [String: Any]) -> LiveSessionSummary? {
        guard let id = json["id"] as? Int else { return nil }
        let coach = json["coach"] as? [String: Any]
        return LiveSessionSummary(
            id: id,
            title: json["title"] as? String ?? "",
            roomName: json["roomName"] as? String ?? "",
            status: json["status"] as? String ?? "LIVE",
            coachName: coach?["name"] as? String
        )
    }
}
