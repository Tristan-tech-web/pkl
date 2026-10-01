import SwiftUI
import WebKit

/// WebView yang memuat pemutar ujian. Jembatan `window.EduSmartNative` meniru versi Android (lock() sinkron, done()).
struct ExamWebView: UIViewRepresentable {
    let host: String
    let token: String
    let secure: Bool
    let onDone: () -> Void

    func makeCoordinator() -> Coordinator { Coordinator(host: host, onDone: onDone) }

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        let lockJson = "{\"secure\":\(secure),\"platform\":\"ios\"}"
        let js = "window.EduSmartNative = { lock: function(){ return '\(lockJson)'; }, done: function(){ window.webkit.messageHandlers.done.postMessage(1); } };"
        cfg.userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        cfg.userContentController.add(context.coordinator, name: "done")
        cfg.websiteDataStore = .nonPersistent()
        cfg.allowsInlineMediaPlayback = false
        let web = WKWebView(frame: .zero, configuration: cfg)
        web.navigationDelegate = context.coordinator
        web.scrollView.bounces = false
        web.allowsLinkPreview = false
        if let url = URL(string: host.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + "/ujian/main#t=\(token)") { web.load(URLRequest(url: url)) }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        let host: String
        let onDone: () -> Void
        init(host: String, onDone: @escaping () -> Void) { self.host = host; self.onDone = onDone }

        func userContentController(_ c: WKUserContentController, didReceive message: WKScriptMessage) { if message.name == "done" { onDone() } }

        // Hanya asal yang sama dengan situs EduSmart.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            let allowed = action.request.url?.host == URL(string: host)?.host
            decisionHandler(allowed ? .allow : .cancel)
        }
    }
}
