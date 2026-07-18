import Observation

/// Shared observable login state. Inject via .environment(authState) at the root,
/// then read with @Environment(AuthState.self) in any view.
@Observable
final class AuthState {
    var isLoggedIn: Bool = TokenStore.isLoggedIn

    func refresh() {
        isLoggedIn = TokenStore.isLoggedIn
    }
}
