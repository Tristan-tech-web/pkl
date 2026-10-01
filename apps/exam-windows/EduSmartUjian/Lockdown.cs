using System.Diagnostics;
using System.Windows.Forms;
using Microsoft.Win32;

namespace EduSmartUjian;

/// <summary>
/// Penguncian tingkat aplikasi untuk Windows: blokir pintasan sistem, lindungi jendela dari tangkapan layar,
/// deteksi mesin virtual, sesi remote, dan proses berisiko. Catatan: tanpa mode kiosk OS (Assigned Access)
/// pengguna mahir tetap bisa melewati pengunci tingkat aplikasi; karena itu semua pelanggaran dilaporkan ke server.
/// </summary>
internal sealed class Lockdown : IDisposable
{
    private IntPtr _hook = IntPtr.Zero;
    private readonly NativeMethods.LowLevelKeyboardProc _proc; // simpan referensi agar tidak di-GC
    public event Action<string>? Blocked;

    private static readonly string[] RiskyProcesses =
    {
        "obs", "obs64", "obs32", "zoom", "teams", "ms-teams", "discord", "skype", "anydesk", "teamviewer", "rustdesk",
        "parsecd", "vncviewer", "tvnserver", "winvnc", "telegram", "whatsapp", "slack", "chrome_remote_desktop_host",
    };

    public Lockdown() { _proc = HookCallback; }

    public bool InstallKeyboardHook()
    {
        using var module = Process.GetCurrentProcess().MainModule!;
        _hook = NativeMethods.SetWindowsHookEx(NativeMethods.WH_KEYBOARD_LL, _proc, NativeMethods.GetModuleHandle(module.ModuleName), 0);
        return _hook != IntPtr.Zero;
    }

    public static bool ProtectFromCapture(IntPtr hwnd) =>
        NativeMethods.SetWindowDisplayAffinity(hwnd, NativeMethods.WDA_EXCLUDEFROMCAPTURE)
        || NativeMethods.SetWindowDisplayAffinity(hwnd, NativeMethods.WDA_MONITOR);

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && (wParam == (IntPtr)NativeMethods.WM_KEYDOWN || wParam == (IntPtr)NativeMethods.WM_SYSKEYDOWN
                           || wParam == (IntPtr)NativeMethods.WM_KEYUP || wParam == (IntPtr)NativeMethods.WM_SYSKEYUP))
        {
            var k = System.Runtime.InteropServices.Marshal.PtrToStructure<NativeMethods.KBDLLHOOKSTRUCT>(lParam);
            var key = (Keys)k.vkCode;
            bool alt = (k.flags & 0x20) != 0;                       // LLKHF_ALTDOWN
            bool ctrl = (NativeMethods.GetAsyncKeyState((int)Keys.ControlKey) & 0x8000) != 0;
            bool shift = (NativeMethods.GetAsyncKeyState((int)Keys.ShiftKey) & 0x8000) != 0;
            bool block =
                key is Keys.LWin or Keys.RWin or Keys.Apps or Keys.Snapshot
                || (alt && key is Keys.Tab or Keys.Escape or Keys.F4 or Keys.Space)
                || (ctrl && key == Keys.Escape)
                || (ctrl && shift && key == Keys.Escape);
            if (block)
            {
                if (wParam == (IntPtr)NativeMethods.WM_KEYDOWN || wParam == (IntPtr)NativeMethods.WM_SYSKEYDOWN) Blocked?.Invoke(key.ToString());
                return (IntPtr)1; // telan tombol
            }
        }
        return NativeMethods.CallNextHookEx(_hook, nCode, wParam, lParam);
    }

    /// <summary>Mendeteksi mesin virtual dari data BIOS (tanpa dependensi tambahan).</summary>
    public static string? DetectVirtualMachine()
    {
        string[] hints = { "vmware", "virtualbox", "vbox", "qemu", "kvm", "xen", "parallels", "hyper-v", "virtual machine", "bochs" };
        foreach (var name in new[] { "SystemManufacturer", "SystemProductName", "BIOSVendor" })
        {
            var v = Registry.GetValue(@"HKEY_LOCAL_MACHINE\HARDWARE\DESCRIPTION\System\BIOS", name, null) as string;
            if (v != null && hints.Any(h => v.Contains(h, StringComparison.OrdinalIgnoreCase))) return v;
        }
        return null;
    }

    public static bool IsRemoteSession() => SystemInformation.TerminalServerSession;

    public static string[] RunningRiskyProcesses() =>
        Process.GetProcesses().Select(p => p.ProcessName.ToLowerInvariant()).Where(n => RiskyProcesses.Contains(n)).Distinct().ToArray();

    public void Dispose()
    {
        if (_hook != IntPtr.Zero) { NativeMethods.UnhookWindowsHookEx(_hook); _hook = IntPtr.Zero; }
    }
}
