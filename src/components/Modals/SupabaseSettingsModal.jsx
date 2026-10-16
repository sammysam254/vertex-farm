import React, { useState, useEffect } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, Key, Shield } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../../lib/supabase';

export function SupabaseSettingsModal({ isOpen, onClose, onConnectedChange }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult(null);

    saveSupabaseConfig(url, key);
    const client = getSupabaseClient();

    if (!client) {
      setTestResult({ success: false, message: 'Please provide both URL and Anon Key.' });
      setTesting(false);
      return;
    }

    try {
      const { data, error } = await client.from('devices').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          setTestResult({
            success: false,
            message: 'Connected to Supabase, but tables are not created yet! Copy and run the SQL schema below in your Supabase SQL editor.'
          });
        } else {
          setTestResult({ success: false, message: `Error: ${error.message}` });
        }
      } else {
        setTestResult({ success: true, message: 'Successfully connected to Supabase PostgreSQL database!' });
        onConnectedChange(true);
      }
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const sqlSchemaText = `-- Vertex Farm Supabase SQL Schema
-- Run this in your Supabase SQL Editor:

create extension if not exists "uuid-ossp";

create table if not exists public.devices (
    id uuid primary key default uuid_generate_v4(),
    serial_number text unique not null,
    device_model text default 'Android Phone',
    worker_name text not null,
    worker_phone text,
    worker_status text default 'active' check (worker_status in ('active', 'terminated', 'on_hold')),
    weekly_target_usd numeric(10, 2) default 40.00 not null,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.withdrawals (
    id uuid primary key default uuid_generate_v4(),
    device_id uuid references public.devices(id) on delete cascade,
    device_serial text not null,
    worker_name text not null,
    amount_usd numeric(10, 2) not null check (amount_usd > 0),
    withdrawal_date date not null default current_date,
    week_cycle_id text not null,
    platform text default 'Surveys',
    notes text,
    created_at timestamptz default now()
);

create table if not exists public.worker_payments (
    id uuid primary key default uuid_generate_v4(),
    device_id uuid references public.devices(id) on delete cascade,
    device_serial text not null,
    worker_name text not null,
    amount_usd numeric(10, 2) not null check (amount_usd > 0),
    payment_date date not null default current_date,
    week_cycle_id text not null,
    payment_method text default 'Cash / Mobile Money',
    notes text,
    created_at timestamptz default now()
);

alter table public.devices enable row level security;
alter table public.withdrawals enable row level security;
alter table public.worker_payments enable row level security;

create policy "Admin access devices" on public.devices for all using (true) with check (true);
create policy "Admin access withdrawals" on public.withdrawals for all using (true) with check (true);
create policy "Admin access payments" on public.worker_payments for all using (true) with check (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase Cloud Database Settings</h3>
              <p className="text-xs text-slate-400">Connect cloud database for live fleet synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4">
          
          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <span>Supabase Project URL</span>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] ml-auto font-normal"
              >
                Open Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input font-mono text-xs"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="form-input font-mono text-xs"
            />
          </div>

          {/* Test connection output */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs border ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Test & Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestAndSave}
              disabled={testing}
              className="btn btn-primary text-xs py-2 w-full"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing Connection...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Save & Test Supabase Connection
                </>
              )}
            </button>
          </div>

          {/* SQL Schema Copy Box */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                PostgreSQL SQL Schema Setup
              </span>
              <button
                onClick={copySql}
                className="btn btn-secondary btn-sm text-[11px] py-1 px-2.5 flex items-center gap-1 text-cyan-300 border-cyan-500/30"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy SQL Schema
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-slate-400 font-mono overflow-x-auto max-h-36">
              {sqlSchemaText}
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              Paste this in your Supabase project's SQL Editor and click "Run".
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
