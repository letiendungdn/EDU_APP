import SwiftUI
import SwiftData

enum AppRoute: Hashable {
    case vocab, srs, sentencePractice, login, cameraTranslate, live
    case aiTutor, pronunciation(kana: String, meaning: String), kanjiDraw(kanji: String, kana: String)
}

struct HomeView: View {
    @Environment(AuthState.self) private var authState
    @Environment(PushService.self) private var pushService
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var modelContext
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Hero
                    VStack(spacing: 8) {
                        Text("🇯🇵").font(.system(size: 52))
                        Text("Học tiếng Nhật")
                            .font(.system(size: 26, weight: .bold))
                        Text("Offline-first · SM-2 SRS · AI Gemini")
                            .font(.system(size: 13))
                            .foregroundStyle(.secondary)
                        HStack(spacing: 6) {
                            Circle()
                                .fill(network.isOnline ? Color.green : Color.orange)
                                .frame(width: 8, height: 8)
                            Text(network.isOnline ? "Online" : "Offline")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 4)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(28)
                    .background(.background, in: RoundedRectangle(cornerRadius: 20))
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(.separator, lineWidth: 0.5))
                    .padding(.bottom, 24)

                    SectionLabel("TÀI KHOẢN")
                    if authState.isLoggedIn {
                        NavCard(title: "Đã đăng nhập", subtitle: "Keycloak / JWT local", icon: "👤") {
                            Task {
                                await pushService.unregisterFromBackend()
                                await AuthAPI().logout()
                                authState.refresh()
                            }
                        }
                    } else {
                        NavCard(title: "Đăng nhập", subtitle: "Keycloak OIDC hoặc email", icon: "🔑") {
                            path.append(AppRoute.login)
                        }
                    }

                    SectionLabel("HỌC TẬP")
                    NavCard(title: "Từ vựng", subtitle: "Đọc offline từ SwiftData, sync khi có mạng", icon: "📖") {
                        path.append(AppRoute.vocab)
                    }
                    NavCard(title: "Ôn tập SRS", subtitle: "Spaced repetition — SM-2 algorithm", icon: "🔁") {
                        path.append(AppRoute.srs)
                    }

                    SectionLabel("LUYỆN TẬP")
                    NavCard(title: "Luyện câu AI", subtitle: "Phân tích & sửa câu bằng Gemini", icon: "🤖", badge: "MỚI") {
                        path.append(AppRoute.sentencePractice)
                    }
                    NavCard(title: "Dịch camera", subtitle: "OCR tiếng Nhật → dịch tiếng Việt", icon: "📷", badge: "MỚI") {
                        path.append(AppRoute.cameraTranslate)
                    }
                    NavCard(title: "Luyện phát âm", subtitle: "Speech-to-text tiếng Nhật + điểm", icon: "🎤") {
                        path.append(AppRoute.pronunciation(kana: "おはようございます", meaning: "Chào buổi sáng"))
                    }
                    NavCard(title: "Vẽ Kanji", subtitle: "Luyện viết tay trên màn hình", icon: "✍️") {
                        path.append(AppRoute.kanjiDraw(kanji: "行", kana: "いく"))
                    }

                    SectionLabel("AI & LIVESTREAM")
                    NavCard(title: "AI Tutor", subtitle: "Hỏi ngữ pháp / từ vựng", icon: "🧠") {
                        path.append(AppRoute.aiTutor)
                    }
                    NavCard(title: "Livestream", subtitle: "Xem / phát buổi học LiveKit", icon: "📡") {
                        path.append(AppRoute.live)
                    }
                }
                .padding(16)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Nihongo EDU")
            .navigationBarTitleDisplayMode(.large)
            .navigationDestination(for: AppRoute.self) { route in
                switch route {
                case .vocab:             VocabView()
                case .srs:               SRSView()
                case .sentencePractice:  SentencePracticeView()
                case .login:             LoginView()
                case .cameraTranslate:   CameraTranslateView()
                case .live:              LiveListView()
                case .aiTutor:           AiTutorView()
                case .pronunciation(let kana, let meaning):
                    PronunciationView(kana: kana, meaning: meaning)
                case .kanjiDraw(let kanji, let kana):
                    KanjiDrawView(kanji: kanji, kana: kana)
                }
            }
            .onAppear { authState.refresh() }
            .task(id: network.isOnline) {
                await SyncService.flushPending(
                    modelContext: modelContext,
                    isOnline: network.isOnline,
                    isLoggedIn: authState.isLoggedIn
                )
            }
            .onReceive(NotificationCenter.default.publisher(for: .navigateToSRS)) { _ in
                path.append(AppRoute.srs)
            }
        }
    }
}

private struct SectionLabel: View {
    let text: String
    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(.secondary)
            .tracking(1)
            .padding(.top, 8)
            .padding(.bottom, 10)
    }
}
