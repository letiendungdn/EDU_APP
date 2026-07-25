import SwiftUI

struct AiTutorView: View {
    @State private var messages: [(role: String, text: String)] = []
    @State private var input = ""
    @State private var loading = false

    private let suggestions = [
        "から vs ので khác nhau thế nào?",
        "て-form dùng khi nào?",
        "Giải thích は vs が",
        "Cách đếm đồ vật trong tiếng Nhật",
    ]

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 10) {
                        if messages.isEmpty {
                            Text("Xin chào! Hỏi bất cứ điều gì về tiếng Nhật.")
                                .padding(.bottom, 8)
                            Text("Gợi ý:").font(.headline)
                            ForEach(suggestions, id: \.self) { s in
                                Button(s) { Task { await send(s) } }
                                    .buttonStyle(.bordered)
                            }
                        }
                        ForEach(Array(messages.enumerated()), id: \.offset) { idx, msg in
                            HStack {
                                if msg.role == "user" { Spacer(minLength: 40) }
                                Text(msg.text)
                                    .padding(12)
                                    .background(msg.role == "user" ? Color.accentColor : Color(.secondarySystemBackground))
                                    .foregroundStyle(msg.role == "user" ? .white : .primary)
                                    .clipShape(RoundedRectangle(cornerRadius: 14))
                                if msg.role != "user" { Spacer(minLength: 40) }
                            }
                            .id(idx)
                        }
                        if loading {
                            ProgressView().padding()
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _, _ in
                    if let last = messages.indices.last {
                        withAnimation { proxy.scrollTo(last, anchor: .bottom) }
                    }
                }
            }

            HStack {
                TextField("Hỏi về ngữ pháp, từ vựng...", text: $input)
                    .textFieldStyle(.roundedBorder)
                    .disabled(loading)
                    .onSubmit { Task { await send(input) } }
                Button {
                    Task { await send(input) }
                } label: {
                    Image(systemName: "paperplane.fill")
                }
                .disabled(loading || input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding()
        }
        .navigationTitle("AI Tutor")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !messages.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Xóa") { messages.removeAll() }
                }
            }
        }
    }

    private func send(_ text: String) async {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !loading else { return }
        input = ""
        messages.append((role: "user", text: trimmed))
        loading = true
        do {
            let history = messages.dropLast().map { ["role": $0.role, "content": $0.text] }
            let answer = try await AiTutorAPI().ask(question: trimmed, history: Array(history))
            messages.append((role: "assistant", text: answer.isEmpty ? "Không có câu trả lời." : answer))
        } catch {
            messages.append((role: "assistant", text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại."))
        }
        loading = false
    }
}
