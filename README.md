# Vertex Farm - Android Survey Fleet & Revenue Ledger

A specialized management system for running multiple Android devices completing surveys, enforcing $40 USD weekly owner quotas, live financial pools (Income, Paid, Profit), zero-tolerance intrusion defenses, and PDF statement exports.

## 🚀 Key Features

- **Hardware & User Security**:
  - Locked to designated master admin account.
  - One-time account registration; signup disappears permanently once created.
  - Zero-tolerance intrusion defense: unauthorized email entries trigger permanent device/IP lockout.
  - Admin email hidden from dashboard and PDF reports.
- **Weekly $40 Quotas**:
  - Cycle runs Sunday to **Saturday 23:59:59** (Payday: Sunday).
  - Live countdown timer to cutoff.
  - Advance deduction safety check prevents paying workers before the $40 owner target is secured.
- **Live Financial Pools**:
  - **Income Pool**: Total survey earnings withdrawn.
  - **Paid Pool**: Total deductions & advances paid out to workers.
  - **Net Profit**: Computed in real-time as `Income Pool - Paid Pool`.
- **PDF Statements**:
  - Full Fleet Summary PDF.
  - Individual Worker Statement PDF with itemized withdrawals, advances, and net Sunday balance.
- **Cloud Backend**:
  - Supabase PostgreSQL database integration (`devices`, `withdrawals`, `worker_payments`).

## 🛠️ Deployment on Netlify

1. Connect this repository to **[Netlify](https://app.netlify.com/)**.
2. Build settings (automatically detected via `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add the following **Environment Variables** in Netlify (**Site configuration** -> **Environment variables**):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_ADMIN_EMAIL`
