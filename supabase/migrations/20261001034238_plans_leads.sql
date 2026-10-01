-- M1 / bagian 2: paket langganan, entitlement, dan formulir kontak enterprise.
create table public.plans (
  code text primary key,
  name text not null,
  description text,
  is_public boolean not null default true,
  is_enterprise boolean not null default false,
  sort int not null default 0
);
create table public.plan_entitlements (
  plan_code text not null references public.plans (code) on delete cascade,
  feature text not null,
  enabled boolean not null default true,
  limit_value int,
  primary key (plan_code, feature)
);
create table public.school_subscriptions (
  school_id uuid primary key references public.schools (id) on delete cascade,
  plan_code text not null references public.plans (code),
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  ai_mode text not null default 'off' check (ai_mode in ('off','byok','platform_demo')),
  started_at timestamptz not null default now(),
  ends_at timestamptz
);
create index on public.school_subscriptions (plan_code);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200 and email like '%_@_%'),
  school_name text check (school_name is null or char_length(school_name) <= 200),
  plan_interest text references public.plans (code),
  message text check (message is null or char_length(message) <= 2000),
  created_at timestamptz not null default now()
);
create index on public.leads (plan_interest);

alter table public.plans enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.school_subscriptions enable row level security;
alter table public.leads enable row level security;

create policy plans_select on public.plans for select to anon, authenticated using (is_public);
create policy entitlements_select on public.plan_entitlements for select to anon, authenticated
  using (exists (select 1 from public.plans p where p.code = plan_code and p.is_public));
create policy subscriptions_select on public.school_subscriptions for select to authenticated
  using (app_private.is_member(school_id));
-- leads: siapa pun boleh mengirim, tidak ada yang bisa membaca lewat API.
create policy leads_insert on public.leads for insert to anon, authenticated with check (true);

revoke all on public.plans, public.plan_entitlements, public.school_subscriptions, public.leads from anon;
grant select on public.plans, public.plan_entitlements to anon;
grant insert on public.leads to anon;

-- Paket awal (nama dan batas bersifat sementara; belum ada keputusan harga).
insert into public.plans (code, name, description, is_enterprise, sort) values
  ('starter', 'Starter', 'Sementara: paket dasar untuk mencoba.', false, 1),
  ('school', 'Sekolah', 'Sementara: fitur lengkap untuk satu sekolah.', false, 2),
  ('enterprise', 'Enterprise', 'Hubungi tim dev: konfigurasi khusus dan SLA.', true, 3);
insert into public.plan_entitlements (plan_code, feature, enabled, limit_value) values
  ('starter', 'max_students', true, 100),
  ('starter', 'ai_tutor', false, null),
  ('starter', 'visual_modules', true, 3),
  ('starter', 'custom_curriculum', false, null),
  ('school', 'max_students', true, 1500),
  ('school', 'ai_tutor', true, null),
  ('school', 'visual_modules', true, null),
  ('school', 'custom_curriculum', true, 3),
  ('enterprise', 'max_students', true, null),
  ('enterprise', 'ai_tutor', true, null),
  ('enterprise', 'visual_modules', true, null),
  ('enterprise', 'custom_curriculum', true, null);
