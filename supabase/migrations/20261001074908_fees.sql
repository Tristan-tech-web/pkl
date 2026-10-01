-- Keuangan sekolah: tagihan per siswa dan pencatatan pembayaran manual (tanpa gerbang pembayaran).
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  member_id uuid not null,
  title text not null check (char_length(title) between 3 and 120),
  amount bigint not null check (amount > 0 and amount <= 1000000000),
  due_on date,
  status text not null default 'terbit' check (status in ('terbit','dibatalkan')),
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.invoices (school_id, member_id);
create index on public.invoices (school_id, due_on);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  invoice_id uuid not null,
  amount bigint not null check (amount > 0),
  method text not null default 'tunai' check (method in ('tunai','transfer','lainnya')),
  paid_on date not null default ((now() at time zone 'Asia/Jakarta')::date),
  note text check (note is null or char_length(note) <= 200),
  recorded_by uuid,
  created_at timestamptz not null default now(),
  foreign key (school_id, invoice_id) references public.invoices (school_id, id) on delete cascade
);
create index on public.payments (school_id, invoice_id);

alter table public.invoices enable row level security;
alter table public.payments enable row level security;
revoke all on public.invoices, public.payments from anon;

create policy invoices_select on public.invoices for select to authenticated
  using (app_private.module_enabled(school_id, 'fees')
         and (app_private.has_capability(school_id, 'members.manage') or member_id = app_private.my_member_id(school_id)
              or app_private.is_guardian_of(school_id, member_id)));
create policy invoices_write on public.invoices for all to authenticated
  using (app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage'));
create policy payments_select on public.payments for select to authenticated
  using (app_private.module_enabled(school_id, 'fees')
         and exists (select 1 from public.invoices i where i.id = payments.invoice_id and i.school_id = payments.school_id
                     and (app_private.has_capability(i.school_id, 'members.manage') or i.member_id = app_private.my_member_id(i.school_id)
                          or app_private.is_guardian_of(i.school_id, i.member_id))));
create policy payments_write on public.payments for all to authenticated
  using (app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage'));

update public.modules set status = 'tersedia' where code = 'fees';
