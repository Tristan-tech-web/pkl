package id.edusmart.ujian

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

/**
 * Layar ujian terkunci.
 *  1. Mengunci perangkat (lock task; penuh bila aplikasi device owner, selain itu screen pinning yang dikonfirmasi siswa).
 *  2. Menukar kode peluncuran dengan token sesi lewat /api/ujian/mulai.
 *  3. Memuat pemutar ujian web di WebView terkunci; soal, timer, dan penilaian tetap di server.
 *  4. Memantau dan melaporkan pelanggaran (keluar fokus, kunci lepas, multi-window, overlay).
 */
class ExamActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var panel: LinearLayout
    private lateinit var message: TextView
    private lateinit var retry: Button
    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private var host = ""
    private var code = ""
    private var token: String? = null
    private var running = false
    private var finished = false
    private var lockWaitMs = 0
    private var lastObscuredReport = 0L
    private val focusLost = Runnable { report("keluar_fokus", JSONObject().put("via", "android")) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        host = intent.getStringExtra("host").orEmpty()
        code = intent.getStringExtra("code").orEmpty()
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE or WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            WindowManager.LayoutParams.FLAG_SECURE or WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
        )
        if (Build.VERSION.SDK_INT >= 31) window.setHideOverlayWindows(true)
        buildUi()
        enterImmersive()
        if (!Api.isAllowedHost(host)) { showMessage("Alamat situs tidak valid.", false); return }
        tryLock()
        waitForLock()
    }

    // ---- UI ----
    @SuppressLint("SetJavaScriptEnabled")
    private fun buildUi() {
        val root = FrameLayout(this).apply { setBackgroundColor(Color.WHITE) }
        web = WebView(this).apply {
            visibility = View.GONE
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false
            settings.setSupportMultipleWindows(false)
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            isLongClickable = false
            setOnLongClickListener { true }
            isHapticFeedbackEnabled = false
            addJavascriptInterface(NativeBridge(), "EduSmartNative")
            webViewClient = object : WebViewClient() {
                // Hanya asal yang sama dengan situs EduSmart; tautan lain diblokir.
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                    request.url.host != android.net.Uri.parse(host).host
            }
            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest) = request.deny()
            }
        }
        panel = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = android.view.Gravity.CENTER; setPadding(48, 48, 48, 48) }
        message = TextView(this).apply { textSize = 18f; gravity = android.view.Gravity.CENTER; setTextColor(Color.parseColor("#13213C")) }
        retry = Button(this).apply { text = "Coba lagi"; visibility = View.GONE; setOnClickListener { retryLock() } }
        panel.addView(message); panel.addView(retry)
        root.addView(web, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        root.addView(panel, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        setContentView(root)
    }

    private fun showMessage(text: String, canRetry: Boolean) {
        message.text = text
        retry.visibility = if (canRetry) View.VISIBLE else View.GONE
        panel.visibility = View.VISIBLE
        web.visibility = View.GONE
    }

    @Suppress("DEPRECATION")
    private fun enterImmersive() {
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
    }

    // ---- Penguncian ----
    private fun lockState(): Int = (getSystemService(ACTIVITY_SERVICE) as ActivityManager).lockTaskModeState
    private fun isLocked() = lockState() != ActivityManager.LOCK_TASK_MODE_NONE

    private fun tryLock() {
        val dpm = getSystemService(DEVICE_POLICY_SERVICE) as DevicePolicyManager
        if (dpm.isDeviceOwnerApp(packageName)) {
            // Perangkat sekolah (device owner): kiosk penuh tanpa Home, Recents, atau notifikasi.
            val admin = ComponentName(this, ExamAdminReceiver::class.java)
            dpm.setLockTaskPackages(admin, arrayOf(packageName))
            if (Build.VERSION.SDK_INT >= 28) dpm.setLockTaskFeatures(admin, 0)
        }
        runCatching { startLockTask() }
    }

    private fun retryLock() {
        lockWaitMs = 0
        showMessage("Mengunci perangkat…", false)
        tryLock()
        waitForLock()
    }

    private fun waitForLock() {
        showMessage("Mengunci perangkat. Jika muncul pertanyaan \"Sematkan layar\", pilih Mulai.", false)
        val poll = object : Runnable {
            override fun run() {
                if (finished) return
                if (isLocked()) { redeem(); return }
                lockWaitMs += 500
                if (lockWaitMs >= 25_000) showMessage("Penguncian belum aktif. Ujian tidak bisa dimulai tanpa penguncian.", true)
                else main.postDelayed(this, 500)
            }
        }
        main.postDelayed(poll, 500)
    }

    // ---- Sesi ujian ----
    private fun redeem() {
        showMessage("Menyiapkan ujian…", false)
        io.execute {
            val r = runCatching {
                val version = packageManager.getPackageInfo(packageName, 0).versionName ?: "1"
                Api.post(host, "/api/ujian/mulai", null, JSONObject().put("code", code).put("platform", "android").put("app_version", version))
            }
            main.post {
                val res = r.getOrNull()
                val tok = res?.body?.optString("token").orEmpty()
                if (res != null && res.status == 200 && tok.isNotEmpty()) {
                    token = tok
                    running = true
                    reportEnvironment()
                    web.visibility = View.VISIBLE
                    panel.visibility = View.GONE
                    web.loadUrl("$host/ujian/main#t=$tok")
                    watchdog()
                } else {
                    showMessage(res?.body?.optString("error").takeUnless { it.isNullOrEmpty() } ?: "Tidak bisa terhubung. Periksa jaringan lalu buka lagi dari halaman Ujian.", false)
                    runCatching { stopLockTask() }
                }
            }
        }
    }

    private fun reportEnvironment() {
        val info = JSONObject()
        info.put("adb", Settings.Global.getInt(contentResolver, Settings.Global.ADB_ENABLED, 0))
        info.put("dev_options", Settings.Global.getInt(contentResolver, Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0))
        info.put("accessibility", !Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES).isNullOrEmpty())
        info.put("lock_state", lockState())
        info.put("device_owner", (getSystemService(DEVICE_POLICY_SERVICE) as DevicePolicyManager).isDeviceOwnerApp(packageName))
        report("info", info)
    }

    /** Memastikan kunci tidak dilepas siswa (mis. kombinasi tombol screen pinning). */
    private fun watchdog() {
        main.postDelayed(object : Runnable {
            override fun run() {
                if (finished) return
                if (running && !isLocked()) {
                    report("kunci_lepas", JSONObject())
                    tryLock()
                }
                enterImmersive()
                main.postDelayed(this, 1000)
            }
        }, 1000)
    }

    private fun report(kind: String, detail: JSONObject) {
        val t = token ?: return
        io.execute { runCatching { Api.post(host, "/api/ujian/peristiwa", t, JSONObject().put("kind", kind).put("detail", detail)) } }
    }

    // ---- Pemantauan integritas ----
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) { main.removeCallbacks(focusLost); enterImmersive() }
        else if (running && !finished) main.postDelayed(focusLost, 1200)
    }

    @Deprecated("Dipakai untuk mendeteksi jendela terbagi")
    override fun onMultiWindowModeChanged(isInMultiWindowMode: Boolean) {
        super.onMultiWindowModeChanged(isInMultiWindowMode)
        if (running && isInMultiWindowMode) report("multi_window", JSONObject())
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        if (running && (ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0) {
            val now = System.currentTimeMillis()
            if (now - lastObscuredReport > 5000) { lastObscuredReport = now; report("layar_tertutup", JSONObject().put("note", "overlay/jendela melayang")) }
            return true // sentuhan lewat overlay diabaikan
        }
        return super.dispatchTouchEvent(ev)
    }

    @Deprecated("Tombol kembali dimatikan selama ujian")
    override fun onBackPressed() { /* sengaja kosong */ }

    override fun onDestroy() {
        if (running && !finished) report("app_dimatikan", JSONObject())
        main.removeCallbacksAndMessages(null)
        io.shutdown()
        super.onDestroy()
    }

    /** Jembatan JS: pemutar web menanyakan status kunci dan memberi tahu saat ujian selesai. */
    inner class NativeBridge {
        @JavascriptInterface
        fun lock(): String = JSONObject().put("secure", isLocked()).put("platform", "android").put("lock_state", lockState()).toString()

        @JavascriptInterface
        fun done() {
            main.post {
                finished = true
                running = false
                runCatching { stopLockTask() }
                finish()
            }
        }
    }
}
