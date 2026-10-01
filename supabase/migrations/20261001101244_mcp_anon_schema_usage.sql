-- Kebijakan Storage unggah sekali pakai (MCP) dievaluasi sebagai anon dan memanggil app_private.mcp_upload_allowed.
-- Skema app_private tidak diekspos PostgREST; hanya fungsi yang di-GRANT eksplisit yang bisa dieksekusi anon.
grant usage on schema app_private to anon;
