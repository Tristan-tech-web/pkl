-- Tes tampilan: kebijakan sekolah hanya diubah pengelola, preferensi pribadi, validasi nilai.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ux uuid := gen_random_uuid(); sa uuid; r_s uuid;
begin
  insert into auth.users (id, email) values (uo,'o@ap.local'),(us,'s@ap.local'),(ux,'x@ap.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah AP', 'kemendikdasmen', 'swasta', array['SMK']);
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa');
  insert into public.school_appearance (school_id, brand_color, student_experience, allowed_themes) values (sa, '#0b6fa4', 'seru', array['laut','kertas']);
  perform pg_temp.chk('pengelola: menyimpan kebijakan', (select count(*) from public.school_appearance) = 1);
  begin insert into public.school_appearance (school_id, brand_color) values (sa, 'merah'); perform pg_temp.chk('warna tak valid ditolak', false);
  exception when others then perform pg_temp.chk('warna tak valid ditolak', true); end;
  insert into public.user_preferences (user_id, theme, experience, font_size) values (uo, 'laut', 'ringkas', 'besar');
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa: membaca kebijakan sekolahnya', (select count(*) from public.school_appearance) = 1);
  begin update public.school_appearance set allow_3d = false where school_id = sa; perform pg_temp.chk('siswa: tak bisa mengubah kebijakan', (select allow_3d from public.school_appearance where school_id = sa) = true);
  exception when others then perform pg_temp.chk('siswa: tak bisa mengubah kebijakan', true); end;
  perform pg_temp.chk('siswa: tidak melihat preferensi orang lain', (select count(*) from public.user_preferences) = 0);
  insert into public.user_preferences (user_id, theme) values (us, 'luar-angkasa');
  begin insert into public.user_preferences (user_id, theme) values (uo, 'x1'); perform pg_temp.chk('tak bisa menulis preferensi orang lain', false);
  exception when others then perform pg_temp.chk('tak bisa menulis preferensi orang lain', true); end;
  begin insert into public.user_preferences (user_id, experience) values (gen_random_uuid(), 'bebas'); perform pg_temp.chk('pengalaman tak dikenal ditolak', false);
  exception when others then perform pg_temp.chk('pengalaman tak dikenal ditolak', true); end;
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('orang luar: tidak melihat kebijakan sekolah', (select count(*) from public.school_appearance) = 0);
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
