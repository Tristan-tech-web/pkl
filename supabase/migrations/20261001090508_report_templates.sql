-- Rapor yang bisa diatur sekolah: templat (kolom, kelompok mapel, bagian, tanda tangan, skala) dan isian tambahan per siswa (sikap, ekskul, prestasi, P5).
create table public.report_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  config jsonb not null,
  is_default boolean not null default false,
  source_file_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, source_file_id) references public.school_files (school_id, id) on delete set null
);
create unique index report_templates_one_default on public.report_templates (school_id) where is_default;
create index on public.report_templates (school_id, source_file_id);

create table public.report_extras (
  school_id uuid not null,
  term_id uuid not null,
  member_id uuid not null,
  section text not null check (section in ('sikap','ekskul','prestasi','p5')),
  data jsonb not null,
  written_by uuid,
  updated_at timestamptz not null default now(),
  primary key (term_id, member_id, section),
  foreign key (school_id, term_id) references public.terms (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.report_extras (school_id, term_id);
create index on public.report_extras (school_id, member_id);

alter table public.report_templates enable row level security;
alter table public.report_extras enable row level security;
revoke all on public.report_templates, public.report_extras from anon;
create policy rt_select on public.report_templates for select to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and app_private.is_member(school_id));
create policy rt_insert on public.report_templates for insert to authenticated
  with check (app_private.module_enabled(school_id, 'gradebook') and app_private.has_capability(school_id, 'curriculum.manage'));
create policy rt_update on public.report_templates for update to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and app_private.has_capability(school_id, 'curriculum.manage'))
  with check (app_private.module_enabled(school_id, 'gradebook') and app_private.has_capability(school_id, 'curriculum.manage'));
create policy rt_delete on public.report_templates for delete to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and app_private.has_capability(school_id, 'curriculum.manage'));

create policy rx_select on public.report_extras for select to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read')));
create policy rx_insert on public.report_extras for insert to authenticated
  with check (app_private.module_enabled(school_id, 'gradebook') and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)));
create policy rx_update on public.report_extras for update to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)))
  with check (app_private.module_enabled(school_id, 'gradebook') and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)));
create policy rx_delete on public.report_extras for delete to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)));

-- Untuk wali: templat bawaan sekolah, isian tambahan, dan deskripsi capaian anak (tanpa membuka tabel).
create function public.child_report_extra(p_school_id uuid, p_child_id uuid, p_term_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_tpl jsonb; v_extras jsonb; v_desc jsonb;
begin
  if not app_private.module_enabled(p_school_id, 'parent_portal') then raise exception 'modul portal orang tua tidak aktif'; end if;
  if not app_private.is_guardian_of(p_school_id, p_child_id) then raise exception 'bukan wali siswa ini'; end if;
  select config into v_tpl from public.report_templates where school_id = p_school_id and is_default;
  select coalesce(jsonb_object_agg(section, data), '{}'::jsonb) into v_extras from public.report_extras where term_id = p_term_id and member_id = p_child_id;
  select coalesce(jsonb_agg(jsonb_build_object('subject', subj, 'items', items)), '[]'::jsonb) into v_desc from (
    select sub.name subj, jsonb_agg(jsonb_build_object('title', a.title, 'pct', round((sc.score / a.max_score * 100)::numeric, 1)) order by a.held_on nulls last) items
    from public.assessment_scores sc join public.assessments a on a.id = sc.assessment_id join public.school_subjects sub on sub.id = a.school_subject_id
    where sc.member_id = p_child_id and a.term_id = p_term_id and sc.score is not null group by sub.name) d;
  return jsonb_build_object('template', v_tpl, 'extras', v_extras, 'assessments', v_desc);
end $$;
revoke execute on function public.child_report_extra(uuid, uuid, uuid) from public, anon;
grant execute on function public.child_report_extra(uuid, uuid, uuid) to authenticated;
comment on function public.child_report_extra(uuid, uuid, uuid) is 'SECURITY DEFINER disengaja: wali membaca isian rapor anak tanpa akses tabel; memeriksa modul dan perwalian.';

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
