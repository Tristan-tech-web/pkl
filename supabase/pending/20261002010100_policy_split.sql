-- BELUM DITERAPKAN. Penerapan lewat MCP dibatalkan otomatis (DROP POLICY), bahkan setelah pengguna menyetujui di obrolan.
-- Terapkan dari SQL editor Supabase atau setujui prompt izin alat, lalu pindahkan berkas ini ke supabase/migrations/
-- dan jalankan tes SQL integrity, learning_path, dan quiz_integrity.
-- Tujuan: hilangkan WARN multiple_permissive_policies. Perilaku dipertahankan (penulis tetap bisa membaca).
drop policy if exists ie_select on public.integrity_exempt;
drop policy if exists ie_write on public.integrity_exempt;
create policy ie_select on public.integrity_exempt for select to authenticated using (
  member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read') or app_private.has_capability(school_id, 'content.author'));
create policy ie_ins on public.integrity_exempt for insert to authenticated with check (app_private.has_capability(school_id, 'content.author'));
create policy ie_upd on public.integrity_exempt for update to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy ie_del on public.integrity_exempt for delete to authenticated using (app_private.has_capability(school_id, 'content.author'));

drop policy if exists ns_write on public.node_schedule;
create policy ns_ins on public.node_schedule for insert to authenticated with check (app_private.has_capability(school_id, 'content.author'));
create policy ns_upd on public.node_schedule for update to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy ns_del on public.node_schedule for delete to authenticated using (app_private.has_capability(school_id, 'content.author'));

drop policy if exists pu_write on public.path_units;
create policy pu_ins on public.path_units for insert to authenticated with check (app_private.has_capability(school_id, 'content.author'));
create policy pu_upd on public.path_units for update to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy pu_del on public.path_units for delete to authenticated using (app_private.has_capability(school_id, 'content.author'));

drop policy if exists si_write on public.school_integrity;
create policy si_ins on public.school_integrity for insert to authenticated with check (app_private.has_capability(school_id, 'school.manage'));
create policy si_upd on public.school_integrity for update to authenticated using (app_private.has_capability(school_id, 'school.manage')) with check (app_private.has_capability(school_id, 'school.manage'));
create policy si_del on public.school_integrity for delete to authenticated using (app_private.has_capability(school_id, 'school.manage'));
