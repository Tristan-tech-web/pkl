import AutomaticAssessmentConfiguration
import SwiftUI
import UIKit

/// Mengatur sesi ujian: penguncian OS (AEAssessmentSession), tukar kode, dan pelaporan pelanggaran.
@MainActor
final class ExamSession: NSObject, ObservableObject, AEAssessmentSessionDelegate {
    enum Phase { case idle, locking, redeeming, running, finished, failed(String) }

    @Published var phase: Phase = .idle
    private(set) var host = ""
    private(set) var token: String?
    private(set) var secure = false
    private var code = ""
    private var assessment: AEAssessmentSession?
    private var lockContinuation: CheckedContinuation<Bool, Never>?

    /// Dipanggil dari tautan edusmart-ujian://mulai?kode=...&host=...
    func start(url: URL) {
        guard url.scheme == "edusmart-ujian",
              let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
              let h = items.first(where: { $0.name == "host" })?.value,
              let c = items.first(where: { $0.name == "kode" })?.value,
              Api.isAllowedHost(h), c.range(of: "^esl_[0-9a-f]{64}$", options: .regularExpression) != nil else {
            phase = .failed("Tautan ujian tidak valid. Buka lagi dari halaman Ujian di EduSmart.")
            return
        }
        host = h; code = c
        Task { await run() }
    }

    private func run() async {
        phase = .locking
        // 1) Kunci perangkat. Sesi penilaian Apple memblokir aplikasi lain, tangkapan/rekaman layar, Siri, dan papan klip.
        secure = await beginLock()
        if !secure {
            phase = .failed("Penguncian belum aktif. Ujian tidak bisa dimulai tanpa penguncian. Tutup lalu buka lagi dari halaman Ujian.")
            return
        }
        // 2) Tukar kode peluncuran dengan token sesi.
        phase = .redeeming
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1"
        let r = await Api.post(host: host, path: "/api/ujian/mulai", token: nil, body: ["code": code, "platform": "ios", "app_version": version])
        guard r.status == 200, let tok = r.json?["token"] as? String else {
            endLock()
            phase = .failed((r.json?["error"] as? String) ?? "Tidak bisa terhubung. Periksa jaringan lalu buka lagi dari halaman Ujian.")
            return
        }
        token = tok
        phase = .running
        startMonitoring()
        report("info", ["guided_access": UIAccessibility.isGuidedAccessEnabled, "assessment": assessment != nil])
    }

    // MARK: Penguncian

    private func beginLock() async -> Bool {
        let config = AEAssessmentConfiguration()
        config.allowsAccessibilitySpeech = false
        config.allowsActivityContinuation = false
        config.allowsKeyboardShortcuts = false
        config.allowsPasswordAutoFill = false
        config.allowsSpellCheck = false
        config.allowsDictation = false
        config.allowsPredictiveKeyboard = false
        let session = AEAssessmentSession(configuration: config)
        session.delegate = self
        assessment = session
        return await withCheckedContinuation { cont in
            lockContinuation = cont
            session.begin()   // Gagal bila entitlement tidak ada (lihat project.yml).
        }
    }

    private func endLock() { assessment?.end(); assessment = nil }

    nonisolated func assessmentSessionDidBegin(_ session: AEAssessmentSession) {
        Task { @MainActor in lockContinuation?.resume(returning: true); lockContinuation = nil }
    }

    nonisolated func assessmentSession(_ session: AEAssessmentSession, failedToBeginWithError error: Error) {
        Task { @MainActor in lockContinuation?.resume(returning: false); lockContinuation = nil }
    }

    nonisolated func assessmentSession(_ session: AEAssessmentSession, wasInterruptedWithError error: Error) {
        Task { @MainActor in
            report("kunci_lepas", ["error": error.localizedDescription])
            phase = .failed("Sesi penilaian terputus. Hubungi pengawas.")
        }
    }

    nonisolated func assessmentSessionDidEnd(_ session: AEAssessmentSession) {}

    // MARK: Pemantauan

    private func startMonitoring() {
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(captured), name: UIScreen.capturedDidChangeNotification, object: nil)
        nc.addObserver(self, selector: #selector(screenshot), name: UIApplication.userDidTakeScreenshotNotification, object: nil)
        nc.addObserver(self, selector: #selector(resignActive), name: UIApplication.willResignActiveNotification, object: nil)
    }

    @objc private func captured() { if UIScreen.main.isCaptured { report("layar_direkam", [:]) } }
    @objc private func screenshot() { report("screenshot", [:]) }
    @objc private func resignActive() { report("keluar_fokus", ["via": "ios"]) }

    func report(_ kind: String, _ detail: [String: Any]) {
        guard let token else { return }
        let host = self.host
        Task.detached { _ = await Api.post(host: host, path: "/api/ujian/peristiwa", token: token, body: ["kind": kind, "detail": detail]) }
    }

    /// Dipanggil pemutar web saat siswa menekan Selesai.
    func finish() {
        NotificationCenter.default.removeObserver(self)
        endLock()
        token = nil
        phase = .finished
    }
}
