import XCTest
@testable import CruiseConnect

final class CruiseConnectTests: XCTestCase {
    func testBridgeChannelIsStable() { XCTAssertEqual(CruiseConnectBridge.channel, "cruiseConnect") }
}
