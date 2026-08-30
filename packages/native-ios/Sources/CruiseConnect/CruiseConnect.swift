import Foundation
import WebKit

public protocol CruiseConnectHost: AnyObject {
    func handle(event: String, payload: [String: Any], completion: @escaping (Result<[String: Any], Error>) -> Void)
}
public final class CruiseConnectBridge: NSObject, WKScriptMessageHandler {
    public weak var host: CruiseConnectHost?
    public static let channel = "cruiseConnect"
    public init(host: CruiseConnectHost) { self.host = host }
    public func install(on configuration: WKWebViewConfiguration) { configuration.userContentController.add(self, name: Self.channel) }
    public func uninstall(from configuration: WKWebViewConfiguration) { configuration.userContentController.removeScriptMessageHandler(forName: Self.channel) }
    public func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == Self.channel, let body = message.body as? [String: Any], let event = body["type"] as? String else { return }
        host?.handle(event: event, payload: body["payload"] as? [String: Any] ?? [:]) { _ in }
    }
}
