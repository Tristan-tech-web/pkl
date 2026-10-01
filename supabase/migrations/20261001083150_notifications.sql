-- Notifikasi dalam aplikasi: pengumuman baru, tagihan baru, nilai baru. Dibuat oleh pemicu, dibaca oleh penerimanya sendiri.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  member_id uuid not null,
  kind text not null check (kind in ('pengumuman','tagihan','nilai')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.notifications (school_id, member_id, created_at desc);
create index on public.notifications (member_id) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from anon;
create policy notifications_select on public.notifications for select to authenticated using (member_id = app_private.my_member_id(school_id));
create policy notifications_update on public.notifications for update to authenticated
  using (member_id = app_private.my_member_id(school_id)) with check (member_id = app_private.my_member_id(school_id));
create policy notifications_delete on public.notifications for delete to authenticated using (member_id = app_private.my_member_id(school_id));

create function app_private.notify(p_school uuid, p_member uuid, p_kind text, p_title text, p_body text, p_link text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Hindari banjir: judul yang sama dan belum dibaca dalam 1 jam tidak dibuat ulang.
  if exists (select 1 from public.notifications n where n.member_id = p_member and n.title = p_title and n.read_at is null and n.created_at > now() - interval '1 hour') then return; end if;
  insert into public.notifications (school_id, member_id, kind, title, body, link) values (p_school, p_member, p_kind, p_title, left(p_body, 200), p_link);
end $$;

-- Wali (orang tua) siswa ikut menerima kabar tentang anaknya.
create function app_private.notify_student_and_guardians(p_school uuid, p_student uuid, p_kind text, p_title text, p_body text, p_link_student text, p_link_parent text) returns void
language plpgsql security definer set search_path = '' as $$
declare g record;
begin
  perform app_private.notify(p_school, p_student, p_kind, p_title, p_body, p_link_student);
  for g in select parent_member_id from public.guardianships where school_id = p_school and student_member_id = p_student loop
    perform app_private.notify(p_school, g.parent_member_id, p_kind, p_title, p_body, p_link_parent);
  end loop;
end $$;

create function app_private.on_announcement() returns trigger language plpgsql security definer set search_path = '' as $$
declare m record; v_link text := '/dashboard/sekolah/' || new.school_id || '/pengumuman';
begin
  for m in
    select sm.id, r.code from public.school_members sm join public.roles r on r.id = sm.role_id
    where sm.school_id = new.school_id and sm.status = 'active' and sm.id <> new.author_member_id
      and case new.audience
        when 'semua' then true
        when 'siswa' then r.code in ('student', 'parent')
        when 'guru' then r.code not in ('student', 'parent')
        else sm.id in (select s.member_id from public.class_group_students s where s.class_group_id = new.class_group_id)
             or sm.id in (select g.parent_member_id from public.guardianships g join public.class_group_students s on s.member_id = g.student_member_id where s.class_group_id = new.class_group_id)
      end
  loop
    perform app_private.notify(new.school_id, m.id, 'pengumuman', new.title, new.body, v_link);
  end loop;
  return new;
end $$;
create trigger announcements_notify after insert on public.announcements for each row execute function app_private.on_announcement();

create function app_private.on_invoice() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_link text := '/dashboard/sekolah/' || new.school_id || '/keuangan';
begin
  perform app_private.notify_student_and_guardians(new.school_id, new.member_id, 'tagihan', 'Tagihan baru: ' || new.title, 'Jumlah Rp' || new.amount::text, v_link, v_link);
  return new;
end $$;
create trigger invoices_notify after insert on public.invoices for each row execute function app_private.on_invoice();

create function app_private.on_score() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_title text;
begin
  if new.score is null or (tg_op = 'UPDATE' and new.score is not distinct from old.score) then return new; end if;
  select a.title into v_title from public.assessments a where a.id = new.assessment_id;
  perform app_private.notify_student_and_guardians(new.school_id, new.member_id, 'nilai', 'Nilai baru: ' || coalesce(v_title, 'penilaian'), 'Nilai sudah dimasukkan guru.',
    '/dashboard/sekolah/' || new.school_id || '/nilai', '/dashboard/sekolah/' || new.school_id);
  return new;
end $$;
create trigger scores_notify after insert or update on public.assessment_scores for each row execute function app_private.on_score();

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
