package id.edusmart.ujian

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** Klien HTTP minimal ke API ujian EduSmart (tanpa dependensi pihak ketiga). */
object Api {
    data class Result(val status: Int, val body: JSONObject?)

    /** Hanya HTTPS; HTTP diizinkan untuk emulator/pengembangan (10.0.2.2, localhost). */
    fun isAllowedHost(host: String): Boolean {
        val h = host.trim().trimEnd('/')
        if (h.startsWith("https://")) return h.length > 8
        return h.startsWith("http://10.0.2.2") || h.startsWith("http://localhost")
    }

    fun post(host: String, path: String, token: String?, json: JSONObject): Result {
        val conn = URL(host.trimEnd('/') + path).openConnection() as HttpURLConnection
        try {
            conn.requestMethod = "POST"
            conn.connectTimeout = 10_000
            conn.readTimeout = 20_000
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json")
            if (token != null) conn.setRequestProperty("Authorization", "Bearer $token")
            conn.outputStream.use { it.write(json.toString().toByteArray()) }
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
            return Result(code, runCatching { JSONObject(text) }.getOrNull())
        } finally {
            conn.disconnect()
        }
    }
}
