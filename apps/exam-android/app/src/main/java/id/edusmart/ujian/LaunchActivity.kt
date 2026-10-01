package id.edusmart.ujian

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Pintu masuk. Normalnya dibuka oleh tautan edusmart-ujian://mulai?kode=...&host=... dari halaman Ujian di web.
 * Untuk jaga-jaga tersedia isian manual kode dan alamat situs.
 */
class LaunchActivity : Activity() {
    private lateinit var error: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val pad = (20 * resources.displayMetrics.density).toInt()
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(pad, pad * 2, pad, pad)
            gravity = Gravity.CENTER_HORIZONTAL
        }
        fun label(text: String, size: Float, bold: Boolean = false) = TextView(this).apply {
            this.text = text; textSize = size; setTextColor(Color.parseColor("#13213C"))
            if (bold) setTypeface(typeface, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = pad / 2 }
        }
        root.addView(label("EduSmart Ujian", 26f, true))
        root.addView(label("Buka ujian dari halaman Ujian di EduSmart, lalu pilih \"Buka aplikasi ujian\". Aplikasi akan mengunci perangkat selama ujian.", 16f))
        val host = EditText(this).apply { hint = "Alamat situs (https://…)"; inputType = InputType.TYPE_TEXT_VARIATION_URI; setSingleLine() }
        val code = EditText(this).apply { hint = "Kode ujian (esl_…)"; setSingleLine() }
        error = label("", 14f).apply { setTextColor(Color.parseColor("#B3261E")) }
        val go = Button(this).apply {
            text = "Mulai"
            setOnClickListener { start(host.text.toString(), code.text.toString()) }
        }
        root.addView(label("Atau isi manual:", 14f))
        root.addView(host); root.addView(code); root.addView(go); root.addView(error)
        setContentView(root)
        handle(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handle(intent)
    }

    private fun handle(i: Intent?) {
        val data = i?.data ?: return
        if (data.scheme != "edusmart-ujian") return
        start(data.getQueryParameter("host").orEmpty(), data.getQueryParameter("kode").orEmpty())
    }

    private fun start(host: String, code: String) {
        val h = host.trim().trimEnd('/')
        if (!Api.isAllowedHost(h)) { error.text = "Alamat situs tidak valid (harus https)."; return }
        if (!Regex("^esl_[0-9a-f]{64}$").matches(code.trim())) { error.text = "Kode ujian tidak valid. Buka lagi dari halaman Ujian."; return }
        error.text = ""
        startActivity(Intent(this, ExamActivity::class.java).putExtra("host", h).putExtra("code", code.trim()))
    }
}
