-- Akses MCP: token pribadi (hanya hash disimpan) dan RPC terkurasi yang memeriksa token sendiri.
-- Tidak ada kunci service-role: tiap fungsi menetapkan identitas dari token lalu memakai pemeriksaan keanggotaan/kapabilitas yang sama dengan RLS.
create table public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  token_hash text not null unique,
  token_hint text not null,
  can_write boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
);
create index on public.mcp_tokens (user_id);
alter table public.mcp_tokens enable row level security;
revoke all on public.mcp_tokens from anon;
create policy mt_select on public.mcp_tokens for select to authenticated using (user_id = (select auth.uid()));
create policy mt_insert on public.mcp_tokens for insert to authenticated with check (user_id = (select auth.uid()));
create policy mt_update on public.mcp_tokens for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy mt_delete on public.mcp_tokens for delete to authenticated using (user_id = (select auth.uid()));

create table public.mcp_pending_uploads (
  path text primary key,
  user_id uuid not null,
  school_id uuid not null,
  scope text not null check (scope in ('sekolah','guru')),
  name text not null,
  mime text,
  expires_at timestamptz not null,
  used_at timestamptz
);
alter table public.mcp_pending_uploads enable row level security;
revoke all on public.mcp_pending_uploads from anon, authenticated;

-- Identitas dari token. Mengembalikan user_id (atau null) dan menetapkan klaim agar auth.uid() dan helper RLS bekerja.
create function app_private.mcp_user(p_token text, p_need_write boolean default false) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v uuid;
begin
  if p_token is null or p_token !~ '^esm_[A-Za-z0-9_-]{40,}$' then return null; end if;
  update public.mcp_tokens set last_used_at = now()
    where token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex') and revoked_at is null
      and (expires_at is null or expires_at > now()) and (can_write or not p_need_write)
    returning user_id into v;
  if v is not null then perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true); end if;
  return v;
end $$;
revoke all on function app_private.mcp_user(text, boolean) from public, anon, authenticated;

create function app_private.mcp_upload_allowed(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.mcp_pending_uploads u where u.path = p_name and u.used_at is null and u.expires_at > now())
$$;
revoke all on function app_private.mcp_upload_allowed(text) from public;
grant execute on function app_private.mcp_upload_allowed(text) to anon, authenticated;
create policy school_files_mcp_insert on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'school-files' and app_private.mcp_upload_allowed(name));
-- Kebijakan Storage di atas dievaluasi sebagai anon; skema app_private tidak diekspos PostgREST.
grant usage on schema app_private to anon;

create function public.mcp_whoami(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token);
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  return jsonb_build_object(
    'name', (select full_name from public.profiles where user_id = v),
    'schools', coalesce((select jsonb_agg(jsonb_build_object('school_id', s.id, 'school', s.name, 'role', r.code, 'role_name', r.name, 'member', m.display_name))
      from public.school_members m join public.schools s on s.id = m.school_id join public.roles r on r.id = m.role_id
      where m.user_id = v and m.status = 'active'), '[]'::jsonb));
end $$;

-- "Hari ini": jadwal, ujian/penilaian terdekat, pengumuman, dan hal yang perlu diperhatikan, sesuai peran.
create function public.mcp_today(p_token text, p_school uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v uuid := app_private.mcp_user(p_token);
  v_me uuid; v_role text; v_today date := (now() at time zone 'Asia/Jakarta')::date; v_wd int; v_out jsonb;
  v_slots jsonb := '[]'::jsonb; v_assess jsonb := '[]'::jsonb; v_ann jsonb := '[]'::jsonb; v_attn jsonb := '[]'::jsonb;
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  select m.id, r.code into v_me, v_role from public.school_members m join public.roles r on r.id = m.role_id
    where m.school_id = p_school and m.user_id = v and m.status = 'active';
  if v_me is null then raise exception 'bukan anggota sekolah ini'; end if;
  v_wd := extract(isodow from v_today)::int;

  if app_private.module_enabled(p_school, 'schedule') then
    select coalesce(jsonb_agg(jsonb_build_object('start', to_char(s.starts_at, 'HH24:MI'), 'end', to_char(s.ends_at, 'HH24:MI'), 'class', g.name, 'subject', sub.name, 'room', s.room,
        'teacher', t.display_name, 'students', (select count(*) from public.class_group_students cs where cs.class_group_id = s.class_group_id)) order by s.starts_at), '[]'::jsonb)
      into v_slots
    from public.schedule_slots s
      join public.class_groups g on g.id = s.class_group_id
      join public.school_subjects sub on sub.id = s.school_subject_id
      left join public.school_members t on t.id = s.teacher_member_id
    where s.school_id = p_school and s.weekday = v_wd
      and (s.teacher_member_id = v_me
           or exists (select 1 from public.class_group_students cs where cs.class_group_id = s.class_group_id and cs.member_id = v_me)
           or (v_role in ('owner','admin','curriculum_lead')));
  end if;

  if app_private.module_enabled(p_school, 'gradebook') then
    select coalesce(jsonb_agg(jsonb_build_object('title', a.title, 'kind', a.kind, 'date', a.held_on, 'class', g.name, 'subject', sub.name) order by a.held_on), '[]'::jsonb)
      into v_assess
    from public.assessments a
      join public.class_groups g on g.id = a.class_group_id
      join public.school_subjects sub on sub.id = a.school_subject_id
    where a.school_id = p_school and a.held_on between v_today and v_today + 14
      and (a.created_by = v_me or v_role in ('owner','admin','curriculum_lead')
           or exists (select 1 from public.class_group_students cs where cs.class_group_id = a.class_group_id and cs.member_id = v_me));
  end if;

  if app_private.module_enabled(p_school, 'announcements') then
    select coalesce(jsonb_agg(jsonb_build_object('title', x.title, 'body', left(x.body, 400), 'date', x.created_at, 'pinned', x.pinned)), '[]'::jsonb) into v_ann
    from (select * from public.announcements an where an.school_id = p_school and app_private.can_see_announcement(an.school_id, an.audience, an.class_group_id)
          order by an.pinned desc, an.created_at desc limit 5) x;
  end if;

  -- Perhatian untuk guru/wali kelas: kelas hari ini yang absensinya belum diisi.
  if v_role not in ('student','parent') and app_private.module_enabled(p_school, 'attendance') then
    select coalesce(jsonb_agg(distinct g.name), '[]'::jsonb) into v_attn
    from public.schedule_slots s join public.class_groups g on g.id = s.class_group_id
    where s.school_id = p_school and s.weekday = v_wd and s.teacher_member_id = v_me
      and not exists (select 1 from public.attendance_records ar where ar.class_group_id = s.class_group_id and ar.on_date = v_today);
  end if;

  v_out := jsonb_build_object('date', v_today, 'weekday', v_wd, 'role', v_role, 'schedule', v_slots, 'upcoming_assessments', v_assess, 'announcements', v_ann, 'attendance_not_taken_yet', v_attn);
  if v_role = 'student' and app_private.module_enabled(p_school, 'fees') then
    v_out := v_out || jsonb_build_object('unpaid_invoices', (select count(*) from public.invoices i where i.member_id = v_me and i.status = 'terbit'
        and i.amount > coalesce((select sum(p.amount) from public.payments p where p.invoice_id = i.id), 0)));
  end if;
  return v_out;
end $$;

create function public.mcp_announcements(p_token text, p_school uuid, p_limit int default 10) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token);
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if not app_private.is_member(p_school) or not app_private.module_enabled(p_school, 'announcements') then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('title', x.title, 'body', x.body, 'date', x.created_at, 'audience', x.audience))
    from (select * from public.announcements an where an.school_id = p_school and app_private.can_see_announcement(an.school_id, an.audience, an.class_group_id)
          order by an.created_at desc limit least(greatest(coalesce(p_limit, 10), 1), 30)) x), '[]'::jsonb);
end $$;

-- Peraturan sekolah boleh dibaca semua anggota; kategori lain hanya untuk yang berhak (pengelola, atau pengunggah sendiri).
create function public.mcp_school_docs(p_token text, p_school uuid, p_query text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token); v_me uuid; v_mgmt boolean;
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if not app_private.is_member(p_school) or not app_private.module_enabled(p_school, 'data_hub') then return '[]'::jsonb; end if;
  v_me := app_private.my_member_id(p_school);
  v_mgmt := app_private.has_capability(p_school, 'members.manage');
  return coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', f.name, 'category', f.category, 'summary', f.ai_summary,
      'excerpt', case when p_query is null or p_query = '' then left(coalesce(f.text_content, ''), 600)
                      else substr(f.text_content, greatest(1, position(lower(p_query) in lower(f.text_content)) - 200), 800) end))
    from (select * from public.school_files sf where sf.school_id = p_school and sf.text_content is not null
            and (sf.category = 'peraturan' or v_mgmt or sf.uploaded_by = v_me)
            and (p_query is null or p_query = '' or sf.text_content ilike '%' || replace(replace(p_query, '%', ''), '_', '') || '%' or sf.name ilike '%' || replace(replace(p_query, '%', ''), '_', '') || '%')
          order by (sf.category = 'peraturan') desc, sf.created_at desc limit 5) f), '[]'::jsonb);
end $$;

create function public.mcp_list_files(p_token text, p_school uuid, p_category text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token); v_me uuid; v_mgmt boolean;
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if not app_private.is_member(p_school) or not app_private.module_enabled(p_school, 'data_hub') then return '[]'::jsonb; end if;
  v_me := app_private.my_member_id(p_school);
  v_mgmt := app_private.has_capability(p_school, 'members.manage');
  if not (v_mgmt or app_private.has_capability(p_school, 'content.author')) then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'name', f.name, 'scope', f.scope, 'category', f.category, 'status', f.status, 'ai_status', f.ai_status, 'summary', f.ai_summary, 'size_bytes', f.size_bytes, 'created_at', f.created_at))
    from (select * from public.school_files sf where sf.school_id = p_school and (v_mgmt or sf.uploaded_by = v_me)
            and (p_category is null or sf.category = p_category) order by sf.created_at desc limit 50) f), '[]'::jsonb);
end $$;

create function public.mcp_read_file(p_token text, p_school uuid, p_file uuid, p_offset int default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token); v_me uuid; v_mgmt boolean; f public.school_files;
begin
  if v is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if not app_private.is_member(p_school) or not app_private.module_enabled(p_school, 'data_hub') then raise exception 'tidak berhak'; end if;
  v_me := app_private.my_member_id(p_school);
  v_mgmt := app_private.has_capability(p_school, 'members.manage');
  select * into f from public.school_files where id = p_file and school_id = p_school;
  if f.id is null or not (f.category = 'peraturan' or v_mgmt or f.uploaded_by = v_me) then raise exception 'berkas tidak ditemukan'; end if;
  return jsonb_build_object('name', f.name, 'category', f.category, 'summary', f.ai_summary, 'total_chars', char_length(coalesce(f.text_content, '')),
    'offset', greatest(p_offset, 0), 'text', substr(coalesce(f.text_content, ''), greatest(p_offset, 0) + 1, 20000),
    'note', case when f.text_content is null then 'Teks tidak tersedia (berkas data pribadi, atau belum dianalisis).' else null end);
end $$;

-- Unggah besar: MCP hanya mengeluarkan jalur sekali pakai; berkas dikirim langsung ke Storage oleh klien AI (curl/POST).
create function public.mcp_request_upload(p_token text, p_school uuid, p_scope text, p_name text, p_mime text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token, true); v_path text;
begin
  if v is null then raise exception 'token tidak valid atau tanpa izin tulis' using errcode = '28000'; end if;
  if not app_private.module_enabled(p_school, 'data_hub') or not app_private.is_member(p_school) then raise exception 'tidak berhak'; end if;
  if p_scope not in ('sekolah','guru') then raise exception 'ruang tidak valid'; end if;
  if not (app_private.has_capability(p_school, 'members.manage') or (p_scope = 'guru' and app_private.has_capability(p_school, 'content.author'))) then
    raise exception 'tidak berhak mengunggah ke ruang ini';
  end if;
  v_path := p_school || '/' || p_scope || '/' || gen_random_uuid() || '-' || left(regexp_replace(coalesce(nullif(p_name, ''), 'berkas'), '[^A-Za-z0-9._-]+', '_', 'g'), 100);
  insert into public.mcp_pending_uploads (path, user_id, school_id, scope, name, mime, expires_at)
    values (v_path, v, p_school, p_scope, left(p_name, 200), p_mime, now() + interval '30 minutes');
  return jsonb_build_object('path', v_path, 'expires_in_seconds', 1800);
end $$;

create function public.mcp_finish_upload(p_token text, p_path text, p_size bigint, p_category text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v uuid := app_private.mcp_user(p_token, true); u public.mcp_pending_uploads; v_me uuid; v_id uuid; v_cat text;
begin
  if v is null then raise exception 'token tidak valid atau tanpa izin tulis' using errcode = '28000'; end if;
  select * into u from public.mcp_pending_uploads where path = p_path and user_id = v and used_at is null and expires_at > now();
  if u.path is null then raise exception 'jalur unggah tidak ditemukan atau kedaluwarsa'; end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'school-files' and o.name = p_path) then raise exception 'berkas belum terkirim ke Storage'; end if;
  v_me := (select id from public.school_members where school_id = u.school_id and user_id = v and status = 'active');
  v_cat := case when p_category in ('belum_dipilah','siswa','guru','sekolah','peraturan','keuangan','kurikulum','buku_paket','lks','rapor_contoh','lainnya') then p_category else 'belum_dipilah' end;
  insert into public.school_files (school_id, scope, uploaded_by, name, mime, size_bytes, path, category, category_source)
    values (u.school_id, u.scope, v_me, u.name, u.mime, greatest(coalesce(p_size, 0), 0), u.path, v_cat, 'manual') returning id into v_id;
  update public.mcp_pending_uploads set used_at = now() where path = p_path;
  return jsonb_build_object('file_id', v_id, 'next', 'Buka menu Berkas di EduSmart: analisis dan pemilahan otomatis berjalan di sana.');
end $$;

do $$
declare f text;
begin
  foreach f in array array['mcp_whoami(text)','mcp_today(text,uuid)','mcp_announcements(text,uuid,integer)','mcp_school_docs(text,uuid,text)','mcp_list_files(text,uuid,text)','mcp_read_file(text,uuid,uuid,integer)','mcp_request_upload(text,uuid,text,text,text)','mcp_finish_upload(text,text,bigint,text)']
  loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;
comment on function public.mcp_today(text, uuid) is 'SECURITY DEFINER dan dapat dipanggil anon DISENGAJA: server MCP tidak punya sesi pengguna; setiap fungsi mcp_* memverifikasi token pribadi (hash) lebih dulu dan menerapkan pemeriksaan keanggotaan/kapabilitas yang setara RLS.';
