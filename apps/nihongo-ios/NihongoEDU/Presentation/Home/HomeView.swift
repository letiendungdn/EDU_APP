import SwiftUI

enum AppRoute: Hashable {
    case vocab, srs, sentencePractice, login
}

struct HomeView: View {
    @Environment(AuthState.self) private var authState
    @Environment(PushService.self) private var pushService
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
                    NavCard(title: "Từ vựng", subtitle: "Đọc offline từ SQLite, sync khi có mạng", icon: "📖") {
                        path.append(AppRoute.vocab)
                    }
                    NavCard(title: "Ôn tập SRS", subtitle: "Spaced repetition — SM-2 algorithm", icon: "🔁") {
                        path.append(AppRoute.srs)
                    }

                    SectionLabel("LUYỆN TẬP")
                    NavCard(title: "Luyện câu AI", subtitle: "Phân tích & sửa câu bằng Gemini", icon: "🤖", badge: "MỚI") {
                        path.append(AppRoute.sentencePractice)
                    }

                    SectionLabel("AI & LIVESTREAM")
                    NavCard(title: "Livestream", subtitle: "Xem coach dạy trực tiếp", icon: "📡") {}
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
                }
            }
            .onAppear { authState.refresh() }
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
