import SwiftUI

@main
struct EduSmartUjianApp: App {
    @StateObject private var session = ExamSession()

    var body: some Scene {
        WindowGroup {
            RootView().environmentObject(session).onOpenURL { session.start(url: $0) }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var session: ExamSession

    var body: some View {
        switch session.phase {
        case .running:
            if let token = session.token {
                ExamWebView(host: session.host, token: token, secure: session.secure) { session.finish() }.ignoresSafeArea()
            }
        case .locking, .redeeming:
            Message("Menyiapkan ujian dan mengunci perangkat…")
        case .failed(let text):
            Message(text)
        case .finished:
            Message("Ujian selesai. Kamu boleh menutup aplikasi.")
        case .idle:
            Message("Buka ujian dari halaman Ujian di EduSmart, lalu pilih \"Buka aplikasi ujian\".")
        }
    }
}

struct Message: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        VStack(spacing: 16) {
            Text("EduSmart Ujian").font(.title.bold())
            Text(text).multilineTextAlignment(.center)
        }.padding(32)
    }
}
