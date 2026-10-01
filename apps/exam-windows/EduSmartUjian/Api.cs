using System.Net.Http.Json;
using System.Text.Json;

namespace EduSmartUjian;

/// <summary>Klien HTTP minimal ke API ujian EduSmart.</summary>
internal static class Api
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(20) };

    /// <summary>Hanya HTTPS; HTTP hanya untuk pengembangan lokal.</summary>
    public static bool IsAllowedHost(string host)
    {
        var h = host.Trim();
        return h.StartsWith("https://", StringComparison.Ordinal) && h.Length > 8
            || h.StartsWith("http://localhost", StringComparison.Ordinal)
            || h.StartsWith("http://127.0.0.1", StringComparison.Ordinal);
    }

    public static async Task<(int Status, JsonElement? Json)> PostAsync(string host, string path, string? token, object body)
    {
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, host.TrimEnd('/') + path) { Content = JsonContent.Create(body) };
            if (token != null) req.Headers.Authorization = new("Bearer", token);
            using var res = await Http.SendAsync(req);
            var text = await res.Content.ReadAsStringAsync();
            JsonElement? json = null;
            try { json = JsonDocument.Parse(text).RootElement.Clone(); } catch (JsonException) { /* bukan JSON */ }
            return ((int)res.StatusCode, json);
        }
        catch (Exception)
        {
            return (0, null);
        }
    }
}
