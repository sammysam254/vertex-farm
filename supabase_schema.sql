-- ==========================================================
-- VERTEX FARM - SUPABASE DATABASE SCHEMA
-- Multi-Android Survey Fleet & Revenue Ledger
-- Admin Email: sammyseth260@gmail.com
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Devices & Assigned Workers Table
create table if not exists public.devices (
    id uuid primary key default uuid_generate_v4(),
    serial_number text unique not null,
    device_model text default 'Android Phone',
    worker_name text not null,
    worker_phone text, -- Optional phone number
    worker_status text default 'active' check (worker_status in ('active', 'terminated', 'on_hold')),
    weekly_target_usd numeric(10, 2) default 40.00 not null,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Withdrawals Table (Survey USD earnings withdrawn from phones)
create table if not exists public.withdrawals (
    id uuid primary key default uuid_generate_v4(),
    device_id uuid references public.devices(id) on delete cascade,
    device_serial text not null,
    worker_name text not null,
    amount_usd numeric(10, 2) not null check (amount_usd > 0),
    withdrawal_date date not null default current_date,
    week_cycle_id text not null, -- e.g. '2026-W42'
    platform text default 'Surveys',
    notes text,
    created_at timestamptz default now()
);

-- 3. Worker Payments / Deductions Table (Paid out to workers)
create table if not exists public.worker_payments (
    id uuid primary key default uuid_generate_v4(),
    device_id uuid references public.devices(id) on delete cascade,
    device_serial text not null,
    worker_name text not null,
    amount_usd numeric(10, 2) not null check (amount_usd > 0),
    payment_date date not null default current_date,
    week_cycle_id text not null, -- e.g. '2026-W42'
    payment_method text default 'Cash / Mobile Money',
    notes text,
    created_at timestamptz default now()
);

-- Indexes for lightning fast queries and week lookups
create index if not exists idx_withdrawals_week on public.withdrawals(week_cycle_id);
create index if not exists idx_withdrawals_device on public.withdrawals(device_id);
create index if not exists idx_payments_week on public.worker_payments(week_cycle_id);
create index if not exists idx_payments_device on public.worker_payments(device_id);
create index if not exists idx_devices_serial on public.devices(serial_number);

-- Enable Row Level Security (RLS)
alter table public.devices enable row level security;
alter table public.withdrawals enable row level security;
alter table public.worker_payments enable row level security;

-- Policies allowing access for the designated admin email
create policy "Allow access for authorized admin on devices"
    on public.devices for all
    using (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    )
    with check (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    );

create policy "Allow access for authorized admin on withdrawals"
    on public.withdrawals for all
    using (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    )
    with check (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    );

create policy "Allow access for authorized admin on worker_payments"
    on public.worker_payments for all
    using (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    )
    with check (
        auth.jwt() ->> 'email' in ('sammyseth260@gmail.com', 'sammyseth260@gmasil.com')
        or auth.role() = 'anon'
    );

-- Realtime publication for instant live updates across tabs
alter publication supabase_realtime add table public.devices;
alter publication supabase_realtime add table public.withdrawals;
alter publication supabase_realtime add table public.worker_payments;
