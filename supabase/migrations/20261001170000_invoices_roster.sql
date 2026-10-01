-- Tagihan untuk siswa yang belum bergabung: menempel ke roster_people, otomatis pindah ke akun saat siswa bergabung.
alter table public.invoices alter column member_id drop not null;
alter table public.invoices add column roster_id uuid;
alter table public.invoices add constraint invoices_roster_fk foreign key (school_id, roster_id) references public.roster_people (school_id, id) on delete cascade;
alter table public.invoices add constraint invoices_owner_chk check (member_id is not null or roster_id is not null);
create index on public.invoices (school_id, roster_id) where roster_id is not null;

create function app_private.roster_link_invoices() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.member_id is not null and (tg_op = 'INSERT' or old.member_id is distinct from new.member_id) then
    update public.invoices set member_id = new.member_id where roster_id = new.id and member_id is null;
  end if;
  return new;
end $$;
create trigger roster_link_invoices after insert or update of member_id on public.roster_people
  for each row execute function app_private.roster_link_invoices();
revoke execute on function app_private.roster_link_invoices() from public, anon;
