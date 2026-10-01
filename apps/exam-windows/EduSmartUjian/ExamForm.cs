using System.Text.Json;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace EduSmartUjian;

/// <summary>Jendela ujian layar penuh: kunci, tukar kode, muat pemutar web, pantau dan laporkan pelanggaran.</summary>
internal sealed class ExamForm : Form
{
    private readonly string _host;
    private readonly string _code;
    private readonly Label _message = new() { Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Segoe UI", 16f), Padding = new Padding(40) };
    private readonly WebView2 _web = new() { Dock = DockStyle.Fill, Visible = false };
    private readonly Lockdown _lock = new();
    private readonly System.Windows.Forms.Timer _watchdog = new() { Interval = 500 };
    private readonly List<Form> _blankers = new();
    private string? _token;
    private bool _running, _finished, _hookOk, _protectOk, _focusLostReported;
    private DateTime _lastKeyReport = DateTime.MinValue;

    public ExamForm(string host, string code)
    {
        _host = host; _code = code;
        Text = "EduSmart Ujian";
        FormBorderStyle = FormBorderStyle.None;
        WindowState = FormWindowState.Maximized;
        TopMost = true;
        ShowInTaskbar = false;
        KeyPreview = true;
        Controls.Add(_web);
        Controls.Add(_message);
        _message.Text = "Menyiapkan ujian…";
        _lock.Blocked += key => { if ((DateTime.Now - _lastKeyReport).TotalSeconds > 3) { _lastKeyReport = DateTime.Now; Report("tombol_terlarang", new { key }); } };
        _watchdog.Tick += (_, _) => Watch();
        Shown += async (_, _) => await StartAsync();
        FormClosing += (_, e) => { if (_running && !_finished) { e.Cancel = true; Report("coba_menutup", new { }); } };
        FormClosed += (_, _) => { _lock.Dispose(); foreach (var b in _blankers) b.Close(); };
    }

    private async Task StartAsync()
    {
        if (!Api.IsAllowedHost(_host)) { Fail("Alamat situs tidak valid."); return; }
        // Pemeriksaan lingkungan: ujian tidak dimulai di mesin virtual atau sesi remote, dan proses berisiko harus ditutup dulu.
        var vm = Lockdown.DetectVirtualMachine();
        if (vm != null) { Fail("Ujian tidak bisa dijalankan di mesin virtual."); return; }
        if (Lockdown.IsRemoteSession()) { Fail("Ujian tidak bisa dijalankan lewat sesi remote desktop."); return; }
        var risky = Lockdown.RunningRiskyProcesses();
        if (risky.Length > 0) { Fail("Tutup aplikasi ini lalu buka ujian lagi: " + string.Join(", ", risky)); return; }

        _hookOk = _lock.InstallKeyboardHook();
        _protectOk = Lockdown.ProtectFromCapture(Handle);
        CoverOtherScreens();
        if (!_hookOk || !_protectOk) { Fail("Penguncian belum aktif di perangkat ini. Hubungi pengawas."); return; }

        var version = typeof(ExamForm).Assembly.GetName().Version?.ToString() ?? "1";
        var (status, json) = await Api.PostAsync(_host, "/api/ujian/mulai", null, new { code = _code, platform = "windows", app_version = version });
        if (status != 200 || json?.TryGetProperty("token", out var tok) != true) { Fail(ErrorText(json) ?? "Tidak bisa terhubung. Periksa jaringan lalu buka lagi dari halaman Ujian."); return; }
        _token = tok.GetString();

        await _web.EnsureCoreWebView2Async();
        var s = _web.CoreWebView2.Settings;
        s.AreDevToolsEnabled = false; s.AreDefaultContextMenusEnabled = false; s.IsZoomControlEnabled = false;
        s.AreBrowserAcceleratorKeysEnabled = false; s.IsStatusBarEnabled = false; s.IsPasswordAutosaveEnabled = false; s.IsGeneralAutofillEnabled = false;
        var lockJson = JsonSerializer.Serialize(new { secure = true, platform = "windows" }).Replace("\\", "\\\\").Replace("'", "\\'");
        await _web.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
            $"window.EduSmartNative = {{ lock: function(){{ return '{lockJson}'; }}, done: function(){{ window.chrome.webview.postMessage('done'); }} }};");
        _web.CoreWebView2.WebMessageReceived += (_, e) => { if (e.TryGetWebMessageAsString() == "done") Finish(); };
        _web.CoreWebView2.NewWindowRequested += (_, e) => e.Handled = true;
        _web.CoreWebView2.NavigationStarting += (_, e) => { if (new Uri(e.Uri).Host != new Uri(_host).Host) e.Cancel = true; };
        _running = true;
        _message.Visible = false; _web.Visible = true;
        _web.CoreWebView2.Navigate($"{_host.TrimEnd('/')}/ujian/main#t={_token}");
        _watchdog.Start();
        Report("info", new { screens = Screen.AllScreens.Length, hook = _hookOk, capture_protected = _protectOk });
    }

    private void CoverOtherScreens()
    {
        foreach (var scr in Screen.AllScreens.Where(s => !s.Primary))
        {
            var b = new Form { FormBorderStyle = FormBorderStyle.None, StartPosition = FormStartPosition.Manual, Bounds = scr.Bounds, BackColor = Color.Black, TopMost = true, ShowInTaskbar = false };
            Lockdown.ProtectFromCapture(b.Handle);
            b.Show(); _blankers.Add(b);
        }
    }

    /// <summary>Menjaga fokus: bila jendela lain mengambil alih, laporkan dan rebut kembali.</summary>
    private void Watch()
    {
        if (!_running || _finished) return;
        if (NativeMethods.GetForegroundWindow() != Handle)
        {
            if (!_focusLostReported) { _focusLostReported = true; Report("keluar_fokus", new { via = "windows" }); }
            Activate(); NativeMethods.SetForegroundWindow(Handle);
        }
        else _focusLostReported = false;
        var risky = Lockdown.RunningRiskyProcesses();
        if (risky.Length > 0 && (DateTime.Now - _lastKeyReport).TotalSeconds > 10) { _lastKeyReport = DateTime.Now; Report("proses_terlarang", new { names = risky }); }
    }

    private void Report(string kind, object detail)
    {
        var t = _token; if (t == null) return;
        _ = Api.PostAsync(_host, "/api/ujian/peristiwa", t, new { kind, detail });
    }

    private void Finish() { _finished = true; _running = false; _watchdog.Stop(); Close(); }
    private void Fail(string text) { _message.Text = text + "\n\n(Tekan Esc untuk menutup.)"; _message.Visible = true; KeyDown += (_, e) => { if (e.KeyCode == Keys.Escape) { _finished = true; Close(); } }; }

    private static string? ErrorText(JsonElement? json) =>
        json is { ValueKind: JsonValueKind.Object } j && j.TryGetProperty("error", out var e) ? e.GetString() : null;
}
