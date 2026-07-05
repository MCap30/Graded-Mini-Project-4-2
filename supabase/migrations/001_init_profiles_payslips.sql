-- =============================================================================
-- PaycheckPal — profiles & payslips schema
-- Privacy-first: no legal_name, company_name, employee_id, or other PII columns
-- Run directly in Supabase SQL Editor or via Supabase CLI: supabase db push
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  monthly_remittance numeric(12, 2) not null default 0.00,

  constraint profiles_monthly_remittance_non_negative
    check (monthly_remittance >= 0)
);

comment on table public.profiles is
  'Per-user settings. Intentionally omits PII (no name, employer, employee ID).';
comment on column public.profiles.id is
  'Matches Supabase Auth user ID (auth.users.id).';
comment on column public.profiles.monthly_remittance is
  'User-declared monthly provincial/family remittance (PHP). Defaults to 0.00.';

-- -----------------------------------------------------------------------------
-- 2. payslips
-- -----------------------------------------------------------------------------
create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  uploaded_at timestamptz not null default now(),
  gross_pay numeric(12, 2) not null,
  net_pay numeric(12, 2) not null,
  sss_deduction numeric(12, 2) not null default 0.00,
  philhealth_deduction numeric(12, 2) not null default 0.00,
  pagibig_deduction numeric(12, 2) not null default 0.00,
  withholding_tax numeric(12, 2) not null default 0.00,

  constraint payslips_gross_pay_non_negative
    check (gross_pay >= 0),
  constraint payslips_net_pay_non_negative
    check (net_pay >= 0),
  constraint payslips_sss_deduction_non_negative
    check (sss_deduction >= 0),
  constraint payslips_philhealth_deduction_non_negative
    check (philhealth_deduction >= 0),
  constraint payslips_pagibig_deduction_non_negative
    check (pagibig_deduction >= 0),
  constraint payslips_withholding_tax_non_negative
    check (withholding_tax >= 0)
);

comment on table public.payslips is
  'Parsed cutoff financial totals only. No employer or employee identifiers stored.';
comment on column public.payslips.user_id is
  'Owner profile; enforced by RLS to match auth.uid().';

-- -----------------------------------------------------------------------------
-- 3. Indexes (history / trend queries)
-- -----------------------------------------------------------------------------
create index if not exists payslips_user_id_idx
  on public.payslips (user_id);

create index if not exists payslips_user_id_uploaded_at_desc_idx
  on public.payslips (user_id, uploaded_at desc);

-- -----------------------------------------------------------------------------
-- 4. Auto-create profile on signup (links Auth session -> profiles row)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.payslips enable row level security;

-- profiles: SELECT
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- profiles: INSERT (self only — e.g. fallback if trigger missed)
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- profiles: UPDATE (monthly_remittance)
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles: DELETE (allow account/data cleanup)
create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- payslips: SELECT
create policy "payslips_select_own"
  on public.payslips
  for select
  to authenticated
  using (auth.uid() = user_id);

-- payslips: INSERT
create policy "payslips_insert_own"
  on public.payslips
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- payslips: UPDATE
create policy "payslips_update_own"
  on public.payslips
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- payslips: DELETE
create policy "payslips_delete_own"
  on public.payslips
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. Grants (authenticated users only; service_role bypasses RLS)
-- -----------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.profiles
  to authenticated;

grant select, insert, update, delete
  on public.payslips
  to authenticated;
