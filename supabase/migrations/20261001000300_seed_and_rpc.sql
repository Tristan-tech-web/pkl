-- M1 / bagian 3: data referensi bawaan, templat peran, profil otomatis, dan RPC create_school.
-- verified=false berarti belum bersumber (⚠ di docs/research/R1-school-domain.md).
insert into public.education_forms (code, name, category, default_authority, default_grades, verified, source_note) values
  ('TK','Taman Kanak-kanak','paud','kemendikdasmen','{0}',true,'PP 17/2010'),
  ('KB','Kelompok Bermain','paud','kemendikdasmen','{0}',true,'PP 17/2010 (nonformal)'),
  ('SD','Sekolah Dasar','dasar','kemendikdasmen','{1,2,3,4,5,6}',true,'PP 17/2010'),
  ('MI','Madrasah Ibtidaiyah','dasar','kemenag','{1,2,3,4,5,6}',true,'PP 17/2010'),
  ('SMP','Sekolah Menengah Pertama','dasar','kemendikdasmen','{7,8,9}',true,'PP 17/2010'),
  ('MTS','Madrasah Tsanawiyah','dasar','kemenag','{7,8,9}',true,'PP 17/2010'),
  ('SMA','Sekolah Menengah Atas','menengah','kemendikdasmen','{10,11,12}',true,'PP 17/2010'),
  ('MA','Madrasah Aliyah','menengah','kemenag','{10,11,12}',true,'PP 17/2010'),
  ('SMK','Sekolah Menengah Kejuruan','menengah','kemendikdasmen','{10,11,12}',true,'PP 17/2010; lama studi bisa berbeda'),
  ('MAK','Madrasah Aliyah Kejuruan','menengah','kemenag','{10,11,12}',true,'PP 17/2010'),
  ('TKLB','TK Luar Biasa','khusus','kemendikdasmen','{0}',true,'PP 17/2010'),
  ('SDLB','SD Luar Biasa','khusus','kemendikdasmen','{1,2,3,4,5,6}',true,'PP 17/2010'),
  ('MILB','MI Luar Biasa','khusus','kemenag','{1,2,3,4,5,6}',true,'PP 17/2010'),
  ('SMPLB','SMP Luar Biasa','khusus','kemendikdasmen','{7,8,9}',true,'PP 17/2010'),
  ('MTSLB','MTs Luar Biasa','khusus','kemenag','{7,8,9}',true,'PP 17/2010'),
  ('SMALB','SMA Luar Biasa','khusus','kemendikdasmen','{10,11,12}',true,'PP 17/2010'),
  ('MALB','MA Luar Biasa','khusus','kemenag','{10,11,12}',true,'PP 17/2010'),
  ('PAKET_A','Kesetaraan Paket A (setara SD)','kesetaraan','kemendikdasmen','{1,2,3,4,5,6}',true,'PKBM; jurnal'),
  ('PAKET_B','Kesetaraan Paket B (setara SMP)','kesetaraan','kemendikdasmen','{7,8,9}',true,'PKBM; jurnal'),
  ('PAKET_C','Kesetaraan Paket C (setara SMA)','kesetaraan','kemendikdasmen','{10,11,12}',true,'PKBM; jurnal'),
  ('PESANTREN','Pesantren','pesantren','kemenag','{}',false,'⚠ status muadalah dan struktur belum diverifikasi'),
  ('SPK','Satuan Pendidikan Kerja Sama','internasional','lainnya','{}',false,'⚠ belum ada sumber'),
  ('KUSTOM','Kustom','kustom','lainnya','{}',true,'bentuk bebas yang ditentukan sekolah');

insert into public.curriculum_packs (code, version, name, grade_to_phase, subject_groups, assessment_scheme, source_url, verified) values
  ('kurmer','2022','Kurikulum Merdeka',
   '{"1":"A","2":"A","3":"B","4":"B","5":"C","6":"C","7":"D","8":"D","9":"D","10":"E","11":"F","12":"F"}',
   '["intrakurikuler","p5","ekstrakurikuler"]',
   '{"type":"tujuan_pembelajaran","kkm":false}',
   'https://eprints.umm.ac.id/id/eprint/14621/3/BAB%202.pdf', false),
  ('k13','2013','Kurikulum 2013','{}','["wajib","peminatan","lintas_minat","muatan_lokal"]',
   '{"type":"kkm","kkm":true}', null, false),
  ('kma-agama','2019','Kurikulum PAI dan Bahasa Arab Madrasah (KMA 183/2019)','{}','["agama_madrasah"]',
   '{"type":"mengikuti_kurikulum_utama"}',
   'https://babel.antaranews.com/berita/155318/madrasah-gunakan-kurikulum-pai-baru-2020-2021', true),
  ('kustom','1','Kustom (kosong)','{}','[]','{"type":"kustom"}', null, true);

insert into public.subject_definitions (pack_id, code, name, group_code)
select p.id, v.code, v.name, v.grp
from public.curriculum_packs p
join (values
  ('kma-agama','QH','Al-Qur''an Hadis','agama_madrasah'),
  ('kma-agama','AA','Akidah Akhlak','agama_madrasah'),
  ('kma-agama','FQ','Fikih','agama_madrasah'),
  ('kma-agama','SKI','Sejarah Kebudayaan Islam','agama_madrasah'),
  ('kma-agama','BAR','Bahasa Arab','agama_madrasah'),
  ('kurmer','MAT','Matematika','intrakurikuler')
) as v(pack, code, name, grp) on v.pack = p.code and p.owner_school_id is null;

insert into public.roles (school_id, code, name, capabilities) values
  (null, 'owner', 'Pemilik/Kepala Sekolah', '{*}'),
  (null, 'admin', 'Admin Sekolah', '{school.manage,members.manage,curriculum.manage,class.manage,content.author,reports.read,students.read}'),
  (null, 'curriculum_lead', 'Wakil Kepala Sekolah Kurikulum', '{curriculum.manage,class.manage,content.author,reports.read,students.read}'),
  (null, 'homeroom', 'Wali Kelas', '{students.read,reports.read,class.read}'),
  (null, 'teacher', 'Guru Mata Pelajaran', '{content.author,grades.write,students.read}'),
  (null, 'counselor', 'Guru BK', '{students.read,reports.read}'),
  (null, 'student', 'Siswa', '{}'),
  (null, 'parent', 'Orang Tua/Wali', '{}');

create function app_private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (user_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function app_private.handle_new_user();

create function public.create_school(
  p_name text, p_authority text, p_ownership text default 'swasta',
  p_forms text[] default '{}', p_pack_code text default 'kurmer',
  p_city text default null, p_province text default null, p_display_name text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_school uuid; v_owner_role uuid; v_pack uuid; f text; v_form public.education_forms;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select id into v_pack from public.curriculum_packs where code = p_pack_code and owner_school_id is null
    order by created_at desc limit 1;
  insert into public.schools (name, authority, ownership, city, province, curriculum_pack_id, created_by)
  values (p_name, p_authority, p_ownership, p_city, p_province, v_pack, v_uid)
  returning id into v_school;
  insert into public.roles (school_id, code, name, capabilities)
  select v_school, code, name, capabilities from public.roles where school_id is null;
  select id into v_owner_role from public.roles where school_id = v_school and code = 'owner';
  insert into public.school_members (school_id, user_id, role_id, display_name)
  values (v_school, v_uid, v_owner_role, p_display_name);
  foreach f in array coalesce(p_forms, '{}') loop
    select * into v_form from public.education_forms where code = f;
    if not found then raise exception 'bentuk pendidikan tidak dikenal: %', f; end if;
    insert into public.school_programs (school_id, form_code, name, grades, curriculum_pack_id)
    values (v_school, f, v_form.name, v_form.default_grades, v_pack);
  end loop;
  insert into public.school_subscriptions (school_id, plan_code) values (v_school, 'starter');
  return v_school;
end $$;
revoke execute on function public.create_school(text, text, text, text[], text, text, text, text) from public, anon;
grant execute on function public.create_school(text, text, text, text[], text, text, text, text) to authenticated;
