import 'dart:ui';

class OverlayLabel {
  const OverlayLabel({
    required this.rect,
    required this.original,
    required this.translated,
  });

  final Rect rect;
  final String original;
  final String translated;
}

/// Map bounding box từ không gian ảnh OCR sang kích thước preview trên màn hình.
Rect mapImageRectToPreview({
  required Rect imageRect,
  required Size imageSize,
  required Size previewSize,
  required int sensorOrientation,
}) {
  final isRotated = sensorOrientation == 90 || sensorOrientation == 270;
  final srcW = isRotated ? imageSize.height : imageSize.width;
  final srcH = isRotated ? imageSize.width : imageSize.height;

  final scale = (previewSize.width / srcW > previewSize.height / srcH)
      ? previewSize.width / srcW
      : previewSize.height / srcH;

  final offsetX = (previewSize.width - srcW * scale) / 2;
  final offsetY = (previewSize.height - srcH * scale) / 2;

  double mapX(double x) => x * scale + offsetX;
  double mapY(double y) => y * scale + offsetY;

  if (sensorOrientation == 90) {
    return Rect.fromLTWH(
      mapX(imageRect.top),
      mapY(imageSize.width - imageRect.right),
      imageRect.height * scale,
      imageRect.width * scale,
    );
  }

  if (sensorOrientation == 270) {
    return Rect.fromLTWH(
      mapX(imageSize.height - imageRect.bottom),
      mapY(imageRect.left),
      imageRect.height * scale,
      imageRect.width * scale,
    );
  }

  return Rect.fromLTWH(
    mapX(imageRect.left),
    mapY(imageRect.top),
    imageRect.width * scale,
    imageRect.height * scale,
  );
}
