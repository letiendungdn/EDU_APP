import Foundation

enum OverlayMapper {
    static func mapFrame(
        _ frame: CGRect,
        imageSize: CGSize,
        viewSize: CGSize
    ) -> CGRect {
        guard imageSize.width > 0, imageSize.height > 0 else { return frame }
        let scale = max(viewSize.width / imageSize.width, viewSize.height / imageSize.height)
        let offsetX = (viewSize.width - imageSize.width * scale) / 2
        let offsetY = (viewSize.height - imageSize.height * scale) / 2
        return CGRect(
            x: frame.minX * scale + offsetX,
            y: frame.minY * scale + offsetY,
            width: max(frame.width * scale, 48),
            height: frame.height * scale
        )
    }
}
