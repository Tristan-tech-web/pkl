using System.Windows.Forms;

namespace EduSmartUjian;

internal static class Program
{
    /// <summary>Dipanggil sistem lewat tautan edusmart-ujian://mulai?kode=...&amp;host=... (didaftarkan install.ps1).</summary>
    [STAThread]
    private static void Main(string[] args)
    {
        using var mutex = new Mutex(true, "EduSmartUjianSingleInstance", out var first);
        if (!first) return;
        ApplicationConfiguration.Initialize();

        string? host = null, code = null;
        if (args.Length > 0 && Uri.TryCreate(args[0], UriKind.Absolute, out var uri) && uri.Scheme == "edusmart-ujian")
        {
            var q = System.Web.HttpUtility.ParseQueryString(uri.Query);
            host = q["host"]; code = q["kode"];
        }
        if (host is null || code is null || !System.Text.RegularExpressions.Regex.IsMatch(code, "^esl_[0-9a-f]{64}$"))
        {
            MessageBox.Show("Buka ujian dari halaman Ujian di EduSmart, lalu pilih \"Buka aplikasi ujian\".", "EduSmart Ujian", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }
        Application.Run(new ExamForm(host.Trim(), code));
    }
}
