import AVFoundation
import SwiftUI

struct KanjiDrawView: View {
    let kanji: String
    let kana: String

    @State private var strokes: [[CGPoint]] = []
    @State private var current: [CGPoint] = []
    @State private var submitted = false
    @State private var correct = false
    private let synthesizer = AVSpeechSynthesizer()

    var body: some View {
        VStack(spacing: 12) {
            Text(kanji)
                .font(.system(size: 56, weight: .bold))
                .foregroundStyle(.tint)
            Text("（\(kana)）").foregroundStyle(.secondary)
            Text("Hãy vẽ chữ trên ô bên dưới").font(.footnote).foregroundStyle(.secondary)

            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 2)
                Text(kanji)
                    .font(.system(size: 160, weight: .bold))
                    .foregroundStyle(.secondary.opacity(0.12))
                Canvas { ctx, size in
                    // grid
                    var v = Path()
                    v.move(to: CGPoint(x: size.width / 2, y: 0))
                    v.addLine(to: CGPoint(x: size.width / 2, y: size.height))
                    var h = Path()
                    h.move(to: CGPoint(x: 0, y: size.height / 2))
                    h.addLine(to: CGPoint(x: size.width, y: size.height / 2))
                    ctx.stroke(v, with: .color(.secondary.opacity(0.3)), style: StrokeStyle(lineWidth: 0.5, dash: [6, 4]))
                    ctx.stroke(h, with: .color(.secondary.opacity(0.3)), style: StrokeStyle(lineWidth: 0.5, dash: [6, 4]))

                    for stroke in strokes + [current] {
                        guard stroke.count > 1 else { continue }
                        var path = Path()
                        path.move(to: stroke[0])
                        for p in stroke.dropFirst() { path.addLine(to: p) }
                        ctx.stroke(path, with: .color(.accentColor), style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))
                    }
                }
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            current.append(value.location)
                            submitted = false
                        }
                        .onEnded { _ in
                            if current.count > 2 { strokes.append(current) }
                            current = []
                        }
                )
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            if submitted {
                Text(correct ? "Tốt lắm! Tiếp tục luyện tập nhé" : "Chưa đủ nét — hãy thử lại!")
                    .foregroundStyle(correct ? .green : .red)
                    .fontWeight(.semibold)
            }

            HStack {
                Button {
                    strokes.removeAll()
                    submitted = false
                } label: {
                    Label("Vẽ lại", systemImage: "arrow.counterclockwise")
                }
                .buttonStyle(.bordered)

                Button {
                    guard !strokes.isEmpty else { return }
                    let total = strokes.reduce(0) { $0 + $1.count }
                    correct = total > 20
                    submitted = true
                    if correct {
                        let u = AVSpeechUtterance(string: kana)
                        u.voice = AVSpeechSynthesisVoice(language: "ja-JP")
                        synthesizer.speak(u)
                    }
                } label: {
                    Label("Kiểm tra", systemImage: "checkmark")
                }
                .buttonStyle(.borderedProminent)
                .disabled(strokes.isEmpty)
            }
        }
        .padding()
        .navigationTitle("Vẽ Kanji")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    if !strokes.isEmpty {
                        strokes.removeLast()
                        submitted = false
                    }
                } label: {
                    Image(systemName: "arrow.uturn.backward")
                }
                .disabled(strokes.isEmpty)
            }
        }
    }

    private var borderColor: Color {
        guard submitted else { return Color(.separator) }
        return correct ? .green : .red
    }
}
