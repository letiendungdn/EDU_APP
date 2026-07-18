import SwiftUI

struct SentencePracticeView: View {
    @State private var viewModel = SentencePracticeViewModel()
    @State private var inputText = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            historyScroll
            Divider()
            inputBar
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Luyện câu AI")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - History

    private var historyScroll: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.history) { entry in
                        FeedbackCard(entry: entry).id(entry.id)
                    }

                    if viewModel.isLoading {
                        HStack(spacing: 10) {
                            ProgressView()
                            Text("Đang phân tích…").foregroundStyle(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(.background, in: RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal)
                    }

                    if let err = viewModel.error {
                        Text(err)
                            .font(.system(size: 13))
                            .foregroundStyle(.red)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(16)
            }
            .onChange(of: viewModel.history.count) { _, _ in
                if let first = viewModel.history.first {
                    withAnimation(.easeOut) { proxy.scrollTo(first.id, anchor: .top) }
                }
            }
        }
    }

    // MARK: - Input bar

    private var inputBar: some View {
        HStack(alignment: .bottom, spacing: 10) {
            TextField("VD: 私は日本語を勉強します", text: $inputText, axis: .vertical)
                .padding(10)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 12))
                .lineLimit(1...4)
                .focused($inputFocused)

            Button {
                let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !text.isEmpty else { return }
                inputText = ""
                inputFocused = false
                Task { await viewModel.analyze(text) }
            } label: {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background(
                        inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isLoading
                            ? Color.red.opacity(0.4) : Color.red,
                        in: Circle()
                    )
            }
            .disabled(inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isLoading)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(.background)
    }
}

// MARK: - Feedback card

private struct FeedbackCard: View {
    let entry: FeedbackEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(entry.sentence)
                .font(.system(size: 17, weight: .semibold))

            if entry.feedback.corrected.isEmpty {
                Label("Câu đúng", systemImage: "checkmark.circle.fill")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.green)
            } else {
                FieldRow(label: "Sửa", value: entry.feedback.corrected, valueColor: .red)
            }

            if !entry.feedback.reading.isEmpty {
                FieldRow(label: "Đọc", value: entry.feedback.reading)
            }
            if !entry.feedback.meaning.isEmpty {
                FieldRow(label: "Nghĩa", value: entry.feedback.meaning)
            }
            if !entry.feedback.explanation.isEmpty {
                FieldRow(label: "Giải thích", value: entry.feedback.explanation)
            }

            if !entry.feedback.examples.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ví dụ:")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.secondary)
                    ForEach(entry.feedback.examples, id: \.self) { ex in
                        Text("・\(ex)").font(.system(size: 13))
                    }
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(.separator, lineWidth: 0.5))
    }
}

private struct FieldRow: View {
    let label: String
    let value: String
    var valueColor: Color = .primary

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(label):")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 14))
                .foregroundStyle(valueColor)
        }
    }
}
