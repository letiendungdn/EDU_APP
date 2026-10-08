// Google ML Kit's iOS pods exclude the arm64 simulator. iOS 27 simulators
// require that slice, so this app cannot link ML Kit and still launch there.
// Camera preview stays available; on-device OCR does not run in that build.
