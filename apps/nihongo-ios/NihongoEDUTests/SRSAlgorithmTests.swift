import XCTest
@testable import NihongoEDU

final class SRSAlgorithmTests: XCTestCase {
    func testQualityBelowThreeResets() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 2.5,
            interval: 15,
            repetitions: 4,
            quality: 2
        )
        XCTAssertEqual(result.repetitions, 0)
        XCTAssertEqual(result.interval, 1)
        XCTAssertFalse(result.mastered)
    }

    func testFirstSuccessIntervalOne() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            quality: 4
        )
        XCTAssertEqual(result.repetitions, 1)
        XCTAssertEqual(result.interval, 1)
    }

    func testSecondSuccessIntervalSix() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 2.5,
            interval: 1,
            repetitions: 1,
            quality: 4
        )
        XCTAssertEqual(result.repetitions, 2)
        XCTAssertEqual(result.interval, 6)
    }

    func testLaterSuccessMultipliesByEase() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 2.5,
            interval: 6,
            repetitions: 2,
            quality: 4
        )
        XCTAssertEqual(result.repetitions, 3)
        XCTAssertEqual(result.interval, 15)
    }

    func testEaseFactorFloor() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 1.3,
            interval: 1,
            repetitions: 0,
            quality: 1
        )
        XCTAssertGreaterThanOrEqual(result.easeFactor, 1.3)
    }

    func testMasteredThreshold() {
        let result = SRSAlgorithm.calculateNextReview(
            easeFactor: 2.5,
            interval: 21,
            repetitions: 4,
            quality: 4
        )
        XCTAssertEqual(result.repetitions, 5)
        XCTAssertGreaterThanOrEqual(result.interval, 21)
        XCTAssertTrue(result.mastered)
    }
}
