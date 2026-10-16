import React from 'react';
import { 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  MinusCircle,
  Smartphone
} from 'lucide-react';
import { formatUSD } from '../utils/dateUtils';

export function PoolCards({
  totalIncome,
  totalPaid,
  netProfit,
  targetHitCount,
  totalDevices,
  onOpenWithdrawal,
  onOpenPayment
}) {
  const quotaPercent = totalDevices > 0 ? Math.round((targetHitCount / totalDevices) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      
      {/* 1. INCOME POOL */}
      <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              INCOME POOL
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mt-1 mono-text tracking-tight">
              {formatUSD(totalIncome)}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              All survey earnings withdrawn
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-cyan-400 font-medium">Live Balance</span>
          <button
            onClick={onOpenWithdrawal}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3" /> Add Withdrawal
          </button>
        </div>
      </div>

      {/* 2. PAID POOL */}
      <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              PAID POOL (WORKERS)
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 mt-1 mono-text tracking-tight">
              {formatUSD(totalPaid)}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Advances & payouts deducted
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-amber-400 font-medium">Deductions</span>
          <button
            onClick={onOpenPayment}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all"
          >
            <MinusCircle className="w-3 h-3" /> Pay Worker
          </button>
        </div>
      </div>

      {/* 3. NET PROFIT */}
      <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              NET PROFIT
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 mt-1 mono-text tracking-tight">
              {formatUSD(netProfit)}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Income Pool - Paid Pool
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Admin Net Margin</span>
          <span className="font-semibold text-emerald-300 font-mono">
            {totalIncome > 0 ? `${Math.round((netProfit / totalIncome) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* 4. $40 QUOTAS HIT */}
      <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              $40 QUOTAS ACHIEVED
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-300 mt-1 mono-text tracking-tight flex items-baseline gap-2">
              <span>{targetHitCount}</span>
              <span className="text-xs sm:text-sm font-normal text-slate-400">/ {totalDevices} devices</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              $40 net due Saturday 23:59
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1.5">
            <span>Fleet Quota Progress</span>
            <span className="font-semibold text-purple-300">{quotaPercent}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${Math.min(100, quotaPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

    </div>
  );
}
