import CryptoKit
import Foundation
import Security

public final class CruiseConnectSecureQueue {
    private let fileURL: URL
    private let keyTag: String
    private let lock = NSLock()

    public init(directory: URL, sailingReference: String) throws {
        let safe = sailingReference.replacingOccurrences(of: "[^A-Za-z0-9_-]", with: "_", options: .regularExpression)
        self.fileURL = directory.appendingPathComponent("cruiseconnect-\(safe).queue", isDirectory: false)
        self.keyTag = "com.tisonik.cruiseconnect.queue.\(safe)"
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    }

    public func read() throws -> Data? {
        lock.lock(); defer { lock.unlock() }
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
        let sealed = try AES.GCM.SealedBox(combined: Data(contentsOf: fileURL))
        return try AES.GCM.open(sealed, using: loadOrCreateKey())
    }

    public func write(_ cleartext: Data) throws {
        lock.lock(); defer { lock.unlock() }
        let sealed = try AES.GCM.seal(cleartext, using: loadOrCreateKey())
        guard let combined = sealed.combined else { throw QueueError.encryptionFailed }
        try combined.write(to: fileURL, options: [.atomic, .completeFileProtection])
    }

    public func purge() throws {
        lock.lock(); defer { lock.unlock() }
        if FileManager.default.fileExists(atPath: fileURL.path) { try FileManager.default.removeItem(at: fileURL) }
        SecItemDelete([kSecClass: kSecClassGenericPassword, kSecAttrAccount: keyTag] as CFDictionary)
    }

    private func loadOrCreateKey() throws -> SymmetricKey {
        let query: [CFString: Any] = [kSecClass: kSecClassGenericPassword, kSecAttrAccount: keyTag, kSecReturnData: true, kSecMatchLimit: kSecMatchLimitOne]
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecSuccess, let data = result as? Data { return SymmetricKey(data: data) }
        guard status == errSecItemNotFound else { throw QueueError.keychain(status) }
        var bytes = Data(count: 32)
        let randomStatus = bytes.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }
        guard randomStatus == errSecSuccess else { throw QueueError.keychain(randomStatus) }
        let add: [CFString: Any] = [kSecClass: kSecClassGenericPassword, kSecAttrAccount: keyTag, kSecValueData: bytes, kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        let addStatus = SecItemAdd(add as CFDictionary, nil)
        guard addStatus == errSecSuccess else { throw QueueError.keychain(addStatus) }
        return SymmetricKey(data: bytes)
    }

    public enum QueueError: Error { case encryptionFailed; case keychain(OSStatus) }
}
