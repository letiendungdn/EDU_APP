import AVFoundation
import SwiftUI
import Vision

struct OverlayLabel: Identifiable {
    let id = UUID()
    var rect: CGRect
    var original: String
    var translated: String
}

/// Camera preview + Japanese OCR (Vision) + /api/translate overlay.
struct CameraTranslateView: View {
    @StateObject private var model = CameraTranslateViewModel()
    @State private var viewSize: CGSize = .zero

    var body: some View {
        ZStack {
            CameraPreviewRepresentable(session: model.session)
                .ignoresSafeArea()
                .background(
                    GeometryReader { geo in
                        Color.clear.onAppear { viewSize = geo.size }
                            .onChange(of: geo.size) { _, size in viewSize = size }
                    }
                )

            ForEach(model.labels) { label in
                let mapped = OverlayMapper.mapFrame(
                    label.rect,
                    imageSize: model.imageSize,
                    viewSize: viewSize
                )
                VStack(alignment: .leading, spacing: 2) {
                    Text(label.original)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.85))
                    Text(label.translated)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.yellow)
                }
                .padding(6)
                .background(.black.opacity(0.55), in: RoundedRectangle(cornerRadius: 6))
                .position(x: mapped.midX, y: mapped.midY)
            }

            VStack {
                Spacer()
                HStack {
                    Button(model.paused ? "Tiếp tục" : "Tạm dừng") {
                        model.paused.toggle()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(model.paused ? .green : .orange)

                    if model.isProcessing {
                        ProgressView().tint(.white)
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Dịch camera")
        .navigationBarTitleDisplayMode(.inline)
        .task { await model.start() }
        .onDisappear { model.stop() }
        .alert("Cần quyền camera", isPresented: $model.permissionDenied) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Bật Camera trong Cài đặt để dùng dịch trực tiếp.")
        }
    }
}

@MainActor
final class CameraTranslateViewModel: NSObject, ObservableObject {
    @Published var labels: [OverlayLabel] = []
    @Published var paused = false
    @Published var isProcessing = false
    @Published var permissionDenied = false
    @Published var imageSize: CGSize = CGSize(width: 1280, height: 720)

    let session = AVCaptureSession()
    private let output = AVCaptureVideoDataOutput()
    private let queue = DispatchQueue(label: "com.edu.nihongo.camera")
    private var lastScan = Date.distantPast
    private let translateAPI = TranslateAPI()
    private var started = false

    func start() async {
        guard !started else { return }
        let granted = await requestCameraAccess()
        guard granted else {
            permissionDenied = true
            return
        }
        configureSession()
        queue.async { [weak self] in self?.session.startRunning() }
        started = true
    }

    func stop() {
        queue.async { [weak self] in self?.session.stopRunning() }
    }

    private func requestCameraAccess() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: return true
        case .notDetermined:
            return await withCheckedContinuation { cont in
                AVCaptureDevice.requestAccess(for: .video) { cont.resume(returning: $0) }
            }
        default: return false
        }
    }

    private func configureSession() {
        session.beginConfiguration()
        session.sessionPreset = .hd1280x720
        defer { session.commitConfiguration() }

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else { return }
        session.addInput(input)

        output.alwaysDiscardsLateVideoFrames = true
        output.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        ]
        output.setSampleBufferDelegate(self, queue: queue)
        if session.canAddOutput(output) {
            session.addOutput(output)
        }
        if let connection = output.connection(with: .video), connection.isVideoOrientationSupported {
            connection.videoOrientation = .portrait
        }
    }

    fileprivate func handleFrame(_ pixelBuffer: CVPixelBuffer) {
        Task { @MainActor in
            guard !paused, !isProcessing else { return }
            let now = Date()
            guard now.timeIntervalSince(lastScan) >= 0.95 else { return }
            lastScan = now
            isProcessing = true

            let width = CGFloat(CVPixelBufferGetWidth(pixelBuffer))
            let height = CGFloat(CVPixelBufferGetHeight(pixelBuffer))

            let request = VNRecognizeTextRequest()
            request.recognitionLevel = .accurate
            request.recognitionLanguages = ["ja-JP", "ja"]
            request.usesLanguageCorrection = true

            do {
                let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up)
                try handler.perform([request])
                let observations = Array((request.results ?? []).prefix(8))
                var next: [OverlayLabel] = []

                for obs in observations {
                    guard let candidate = obs.topCandidates(1).first else { continue }
                    let text = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !text.isEmpty else { continue }

                    let box = obs.boundingBox
                    let rect = CGRect(
                        x: box.minX * width,
                        y: (1 - box.maxY) * height,
                        width: box.width * width,
                        height: box.height * height
                    )
                    guard rect.width >= 8, rect.height >= 8 else { continue }

                    let translated: String
                    do {
                        translated = try await translateAPI.translateJapanese(text)
                    } catch {
                        translated = text
                    }
                    next.append(OverlayLabel(rect: rect, original: text, translated: translated))
                }

                imageSize = CGSize(width: width, height: height)
                labels = next
            } catch {
                // bỏ qua frame lỗi
            }
            isProcessing = false
        }
    }
}

extension CameraTranslateViewModel: AVCaptureVideoDataOutputSampleBufferDelegate {
    nonisolated func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        // Retain buffer for async OCR — copy by keeping CVPixelBuffer alive until Task finishes.
        CVPixelBufferRetain(pixelBuffer)
        Task { @MainActor in
            defer { CVPixelBufferRelease(pixelBuffer) }
            self.handleFrame(pixelBuffer)
        }
    }
}

struct CameraPreviewRepresentable: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> PreviewView {
        let view = PreviewView()
        view.previewLayer.session = session
        view.previewLayer.videoGravity = .resizeAspectFill
        return view
    }

    func updateUIView(_ uiView: PreviewView, context: Context) {}

    final class PreviewView: UIView {
        override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
        var previewLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }
    }
}
