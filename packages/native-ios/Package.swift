// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "CruiseConnect", platforms: [.iOS(.v15), .macOS(.v12)], products: [.library(name: "CruiseConnect", targets: ["CruiseConnect"])], targets: [.target(name: "CruiseConnect", resources: [.process("PrivacyInfo.xcprivacy")]), .testTarget(name: "CruiseConnectTests", dependencies: ["CruiseConnect"])])
