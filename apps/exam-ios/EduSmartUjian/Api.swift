import Foundation

/// Klien HTTP minimal ke API ujian EduSmart.
enum Api {
    struct Result { let status: Int; let json: [String: Any]? }

    /// Hanya HTTPS; HTTP hanya untuk simulator/pengembangan (localhost).
    static func isAllowedHost(_ host: String) -> Bool {
        let h = host.trimmingCharacters(in: .whitespaces)
        if h.hasPrefix("https://") { return h.count > 8 }
        return h.hasPrefix("http://localhost") || h.hasPrefix("http://127.0.0.1")
    }

    static func post(host: String, path: String, token: String?, body: [String: Any]) async -> Result {
        guard let url = URL(string: host.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + path) else { return Result(status: 0, json: nil) }
        var req = URLRequest(url: url, timeoutInterval: 20)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            let status = (resp as? HTTPURLResponse)?.statusCode ?? 0
            return Result(status: status, json: (try? JSONSerialization.jsonObject(with: data)) as? [String: Any])
        } catch {
            return Result(status: 0, json: nil)
        }
    }
}
