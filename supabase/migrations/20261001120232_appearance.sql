-- Tampilan: kebijakan sekolah (pengelola) dan preferensi pengguna. Tampilan efektif dihitung di aplikasi (lib/appearance.ts).
create table public.school_appearance (
  school_id uuid primary key references public.schools (id) on delete cascade,
  brand_color text check (brand_color is null or brand_color ~ '^#[0-9a-fA-F]{6}$'),
  student_experience text not null default 'auto' check (student_experience in ('auto','ceria','seru','ringkas')),
  staff_experience text not null default 'ringkas' check (staff_experience in ('ceria','seru','ringkas')),
  staff_can_change boolean not null default false,
  allowed_themes text[],
  default_theme text check (default_theme is null or default_theme ~ '^[a-z0-9-]{2,30}$'),
  allow_3d boolean not null default true,
  allow_sound boolean not null default true,
  student_can_customize boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.school_appearance enable row level security;
revoke all on public.school_appearance from anon;
create policy sa_select on public.school_appearance for select to authenticated using (app_private.is_member(school_id));
create policy sa_insert on public.school_appearance for insert to authenticated with check (app_private.has_capability(school_id, 'school.manage'));
create policy sa_update on public.school_appearance for update to authenticated using (app_private.has_capability(school_id, 'school.manage')) with check (app_private.has_capability(school_id, 'school.manage'));
create policy sa_delete on public.school_appearance for delete to authenticated using (app_private.has_capability(school_id, 'school.manage'));

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text check (theme is null or theme ~ '^[a-z0-9-]{2,30}$'),
  experience text check (experience is null or experience in ('ceria','seru','ringkas')),
  font_size text check (font_size is null or font_size in ('normal','besar','sangat-besar')),
  density text check (density is null or density in ('rapat','normal','longgar')),
  motion text check (motion is null or motion in ('penuh','kurangi')),
  scene3d text check (scene3d is null or scene3d in ('auto','mati')),
  sound boolean,
  relaxed boolean,
  avatar jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
revoke all on public.user_preferences from anon;
create policy up_select on public.user_preferences for select to authenticated using (user_id = (select auth.uid()));
create policy up_insert on public.user_preferences for insert to authenticated with check (user_id = (select auth.uid()));
create policy up_update on public.user_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy up_delete on public.user_preferences for delete to authenticated using (user_id = (select auth.uid()));
