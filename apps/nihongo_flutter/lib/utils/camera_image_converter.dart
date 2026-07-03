import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

/// Chuyển frame camera stream → InputImage cho ML Kit.
InputImage? cameraImageToInputImage(
  CameraImage image,
  CameraDescription camera,
) {
  final rotation = _rotation(camera);
  if (rotation == null) return null;

  final format = _format(image);
  if (format == null) return null;

  if (image.planes.isEmpty) return null;

  return InputImage.fromBytes(
    bytes: _concatenatePlanes(image.planes),
    metadata: InputImageMetadata(
      size: Size(image.width.toDouble(), image.height.toDouble()),
      rotation: rotation,
      format: format,
      bytesPerRow: image.planes.first.bytesPerRow,
    ),
  );
}

InputImageFormat? _format(CameraImage image) {
  if (Platform.isAndroid) {
    return InputImageFormat.yuv420;
  }
  if (Platform.isIOS) {
    return InputImageFormat.bgra8888;
  }
  return null;
}

InputImageRotation? _rotation(CameraDescription camera) {
  if (Platform.isIOS) {
    return InputImageRotationValue.fromRawValue(camera.sensorOrientation);
  }

  if (Platform.isAndroid) {
    const deviceOrientation = InputImageRotation.rotation0deg;
    var rotationCompensation = camera.sensorOrientation;

    switch (deviceOrientation) {
      case InputImageRotation.rotation0deg:
        rotationCompensation = camera.sensorOrientation;
      case InputImageRotation.rotation90deg:
        rotationCompensation = (camera.sensorOrientation + 90) % 360;
      case InputImageRotation.rotation180deg:
        rotationCompensation = (camera.sensorOrientation + 180) % 360;
      case InputImageRotation.rotation270deg:
        rotationCompensation = (camera.sensorOrientation + 270) % 360;
    }

    return InputImageRotationValue.fromRawValue(rotationCompensation);
  }

  return null;
}

Uint8List _concatenatePlanes(List<Plane> planes) {
  final buffer = WriteBuffer();
  for (final plane in planes) {
    buffer.putUint8List(plane.bytes);
  }
  return buffer.done().buffer.asUint8List();
}
