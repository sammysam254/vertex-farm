import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Clock, 
  Calendar, 
  Database, 
  Download, 
  Plus, 
  ShieldCheck, 
  LogOut, 
  Settings,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { getTimeUntilDeadline } from '../utils/dateUtils';

export function Header({
  weekCycle,
  pastWeeks,
  onSelectWeek,
  onOpenAddDevice,
  onOpenWithdrawal,
  onOpenPayment,
  onExportAllPDF,
  onOpenSettings,
  adminEmail,
  onLogout,
  isSupabaseConnected
}) {
  const [countdown, setCountdown] = useState(getTimeUntilDeadline(weekCycle.deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilDeadline(weekCycle.deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [weekCycle.deadline]);

  return (
    <header className="glass-panel border-b border-white/10 px-4 lg:px-8 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Admin Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  VERTEX FARM
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SURVEY FLEET
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Master Administrator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10"
              title="Supabase Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Countdown to Saturday 23:59 */}
        <div className="w-full md:w-auto flex items-center justify-center">
          <div className="glass-panel px-4 py-2 border-white/10 flex items-center gap-3 bg-slate-900/80 rounded-xl">
            <div className="relative">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>$40 Cutoff: Sat 23:59</span>
                {weekCycle.isCurrentWeek && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {countdown.text}
              </div>
            </div>
          </div>
        </div>

        {/* Week Selector & Top Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          
          {/* Week Dropdown */}
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={weekCycle.id}
              onChange={(e) => {
                const found = pastWeeks.find(w => w.id === e.target.value);
                if (found) onSelectWeek(found);
              }}
              className="form-select pl-9 pr-8 py-2 text-xs font-medium rounded-lg bg-slate-900 border-white/10 text-slate-200 cursor-pointer focus:ring-1 focus:ring-cyan-500"
            >
              {pastWeeks.map(w => (
                <option key={w.id} value={w.id}>
                  {w.isCurrentWeek ? `Current Week (${w.label})` : w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Database / Supabase indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Configure Supabase Database"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Live' : 'Supabase Setup'}</span>
          </button>

          {/* Export All PDF */}
          <button
            onClick={onExportAllPDF}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            title="Export full fleet ledger as PDF"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>PDF Export</span>
          </button>

          {/* Add Device */}
          <button
            onClick={onOpenAddDevice}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Device</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
            title="Lock Ledger"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
