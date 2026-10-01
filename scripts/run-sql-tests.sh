#!/bin/bash
# Menjalankan tes SQL (supabase/tests/*.test.sql) lewat Management API (HTTPS).
# Butuh: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF. Tes selalu membatalkan transaksinya
# dan melaporkan hasil lewat pesan galat "HASIL_TES <jumlah> | gagal=[...]".
set -uo pipefail
: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN belum diatur}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF belum diatur}"
cd "$(git rev-parse --show-toplevel)"
status=0
for f in supabase/tests/*.test.sql; do
  body=$(jq -Rs '{query: .}' "$f")
  out=$(curl -sS -X POST "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" -H "Content-Type: application/json" -d "$body")
  if echo "$out" | grep -q 'gagal=\[\]'; then
    echo "LULUS  $f ($(echo "$out" | grep -o 'HASIL_TES [0-9]*' | head -1))"
  else
    echo "GAGAL  $f"; echo "$out" | head -c 800; echo; status=1
  fi
done
exit $status
