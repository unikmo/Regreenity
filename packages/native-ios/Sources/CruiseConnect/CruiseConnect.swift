import Foundation
import WebKit

public protocol CruiseConnectHost: AnyObject {
    func handle(event: String, payload: [String: Any], completion: @escaping (Result<[String: Any], Error>) -> Void)
}
public final class CruiseConnectBridge: NSObject, WKScriptMessageHandler {
    public weak var host: CruiseConnectHost?
    public static let channel = "cruiseConnect"
    private let trustedScheme: String
    private let trustedHost: String
    private let trustedPort: Int
    public init(host: CruiseConnectHost, trustedOrigin: URL) {
        guard trustedOrigin.scheme == "https", let scheme = trustedOrigin.scheme, let originHost = trustedOrigin.host else { preconditionFailure("CruiseConnect requires an HTTPS trusted origin") }
        self.host = host
        self.trustedScheme = scheme
        self.trustedHost = originHost
        self.trustedPort = trustedOrigin.port ?? 443
    }
    public func install(on configuration: WKWebViewConfiguration) { configuration.userContentController.add(self, name: Self.channel) }
    public func uninstall(from configuration: WKWebViewConfiguration) { configuration.userContentController.removeScriptMessageHandler(forName: Self.channel) }
    public func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.name == Self.channel,
              message.frameInfo.isMainFrame,
              origin.protocol == trustedScheme,
              origin.host == trustedHost,
              origin.port == trustedPort,
              let body = message.body as? [String: Any],
              let event = body["type"] as? String else { return }
        host?.handle(event: event, payload: body["payload"] as? [String: Any] ?? [:]) { _ in }
    }
}
