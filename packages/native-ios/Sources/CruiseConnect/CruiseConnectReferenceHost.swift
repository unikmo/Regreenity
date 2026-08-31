import Foundation

public final class CruiseConnectReferenceHost: CruiseConnectHost {
    private let queue: CruiseConnectSecureQueue
    public init(queue: CruiseConnectSecureQueue) { self.queue = queue }
    public func handle(event: String, payload: [String: Any], completion: @escaping (Result<[String: Any], Error>) -> Void) {
        do {
            let data = try JSONSerialization.data(withJSONObject: ["type": event, "payload": payload, "queuedAt": ISO8601DateFormatter().string(from: Date())])
            try queue.write(data)
            completion(.success(["accepted": true, "queuedSecurely": true]))
        } catch { completion(.failure(error)) }
    }
}
