import XCTest
@testable import NihongoEDU

final class OverlayMapperTests: XCTestCase {
    func testIdentityMapping() {
        let mapped = OverlayMapper.mapFrame(
            CGRect(x: 10, y: 20, width: 100, height: 40),
            imageSize: CGSize(width: 200, height: 200),
            viewSize: CGSize(width: 200, height: 200)
        )
        XCTAssertEqual(mapped.origin.x, 10, accuracy: 0.01)
        XCTAssertEqual(mapped.origin.y, 20, accuracy: 0.01)
        XCTAssertEqual(mapped.width, 100, accuracy: 0.01)
        XCTAssertEqual(mapped.height, 40, accuracy: 0.01)
    }

    func testMinimumWidth() {
        let mapped = OverlayMapper.mapFrame(
            CGRect(x: 0, y: 0, width: 10, height: 10),
            imageSize: CGSize(width: 100, height: 100),
            viewSize: CGSize(width: 100, height: 100)
        )
        XCTAssertEqual(mapped.width, 48, accuracy: 0.01)
    }
}
