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
    <header className="glass-panel border-b border-white/10 px-3 sm:px-6 py-3.5 sm:py-4 mb-4 sm:mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Admin Badge */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 flex-shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  VERTEX FARM
                  <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    FLEET
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-[11px] sm:text-xs">Master Administrator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </div>

          {/* Quick Mobile Settings & Logout */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                isSupabaseConnected 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
              title="Cloud Database"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-white/10"
              title="Lock System"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Countdown to Saturday 23:59 */}
        <div className="w-full md:w-auto flex items-center justify-center">
          <div className="glass-panel w-full sm:w-auto px-3.5 sm:px-4 py-2 border-white/10 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 bg-slate-900/90 rounded-xl">
            <div className="relative flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <span>$40 Cutoff: Sat 23:59</span>
                {weekCycle.isCurrentWeek && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-mono font-bold text-amber-300">
                {countdown.text}
              </div>
            </div>
          </div>
        </div>

        {/* Week Selector & Top Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between sm:justify-end">
          
          {/* Week Dropdown */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[170px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={weekCycle.id}
              onChange={(e) => {
                const found = pastWeeks.find(w => w.id === e.target.value);
                if (found) onSelectWeek(found);
              }}
              className="form-select pl-8 pr-7 py-2 text-xs font-medium rounded-lg bg-slate-900 border-white/10 text-slate-200 cursor-pointer w-full"
            >
              {pastWeeks.map(w => (
                <option key={w.id} value={w.id}>
                  {w.isCurrentWeek ? `Current Week (${w.label})` : w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Database / Supabase indicator (Desktop) */}
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
            className="btn btn-secondary btn-sm flex items-center gap-1 py-2 px-2.5 sm:px-3 text-xs"
            title="Export full fleet ledger as PDF"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Add Device */}
          <button
            onClick={onOpenAddDevice}
            className="btn btn-primary btn-sm flex items-center gap-1 py-2 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Device</span>
          </button>

          {/* Logout (Desktop) */}
          <button
            onClick={onLogout}
            className="hidden md:flex p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
            title="Lock Ledger"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
