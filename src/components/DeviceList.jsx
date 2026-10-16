import React, { useState } from 'react';
import { 
  Smartphone, 
  User, 
  Phone, 
  Edit3, 
  FileText, 
  Plus, 
  MinusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  UserX,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatUSD } from '../utils/dateUtils';

export function DeviceList({
  devices,
  withdrawals,
  payments,
  onOpenWithdrawalForDevice,
  onOpenPaymentForDevice,
  onEditDevice,
  onExportWorkerPDF
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.worker_phone && device.worker_phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && device.worker_status !== 'terminated';
    if (filterStatus === 'terminated') return matchesSearch && device.worker_status === 'terminated';
    return matchesSearch;
  });

  return (
    <div className="glass-panel p-4 sm:p-5 mb-4 sm:mb-6">
      
      {/* Table Header & Search Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Device Fleet & Assigned Workers
          </h2>
          <p className="text-xs text-slate-400">
            Android survey phones, weekly $40 quotas, and individual worker status
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial, worker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-8 py-2 sm:py-1.5 text-xs rounded-lg"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select py-2 sm:py-1.5 text-xs rounded-lg w-auto text-slate-300"
          >
            <option value="all">All Devices</option>
            <option value="active">Active Only</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Devices Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {filteredDevices.map(device => {
          // Device calculations for active week
          const devWithdrawals = withdrawals.filter(
            w => w.device_serial === device.serial_number || w.device_id === device.id
          );
          const devPayments = payments.filter(
            p => p.device_serial === device.serial_number || p.device_id === device.id
          );

          const earned = devWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
          const paid = devPayments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0);
          
          // Remaining balance after what was paid is deducted
          const remainingBalance = earned - paid;
          const target = Number(device.weekly_target_usd || 40);
          
          // Target is achieved ONLY if the balance after what is paid is >= 40
          const quotaAchieved = remainingBalance >= target;
          const quotaPercent = Math.min(100, Math.max(0, Math.round((remainingBalance / target) * 100)));
          const remainingToHitTarget = Math.max(0, target - remainingBalance);
          const workerSurplus = Math.max(0, remainingBalance - target);
          const isTerminated = device.worker_status === 'terminated';

          return (
            <div 
              key={device.id || device.serial_number}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                isTerminated 
                  ? 'bg-slate-900/40 border-rose-500/20 opacity-70' 
                  : quotaAchieved
                    ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900/70 border-white/10 hover:border-cyan-500/40'
              }`}
            >
              {/* Card Top: Serial, Model & Worker */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                    quotaAchieved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {device.serial_number.slice(-3)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                        {device.serial_number}
                      </span>
                      {isTerminated ? (
                        <span className="badge badge-danger text-[9px] sm:text-[10px] py-0.5">
                          Terminated
                        </span>
                      ) : quotaAchieved ? (
                        <span className="badge badge-success text-[9px] sm:text-[10px] py-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Target Met ($40+)
                        </span>
                      ) : (
                        <span className="badge badge-warning text-[9px] sm:text-[10px] py-0.5 font-mono">
                          {formatUSD(remainingToHitTarget)} left
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                      <span>{device.device_model || 'Android Phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Worker Button */}
                <button
                  onClick={() => onEditDevice(device)}
                  className="btn btn-secondary btn-sm p-1.5 text-slate-400 hover:text-white flex-shrink-0"
                  title="Edit Worker Details / Reassign Serial"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Worker Profile Box */}
              <div className="mt-2.5 sm:mt-3 p-2 sm:p-2.5 rounded-lg bg-slate-950/50 border border-white/5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-200 truncate">{device.worker_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs">
                  <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span>{device.worker_phone ? device.worker_phone : <em className="text-slate-600">No phone</em>}</span>
                </div>
              </div>

              {/* Quota Progress Bar based on Remaining Net Balance */}
              <div className="mt-2.5 sm:mt-3">
                <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                  <span className="text-slate-400 font-medium">
                    Owner Target: <strong className="text-white">$40.00</strong>
                  </span>
                  <span className={`font-mono font-bold ${quotaAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatUSD(remainingBalance)} / $40.00
                  </span>
                </div>
                <div className="progress-track bg-slate-800">
                  <div
                    className={`progress-fill ${
                      quotaAchieved 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : 'bg-gradient-to-r from-amber-500 to-cyan-400'
                    }`}
                    style={{ width: `${quotaPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Financial Snapshot with Remaining Unpaid Balance */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 p-2 rounded-lg bg-slate-950/40 text-center text-xs">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase truncate">Earned</div>
                  <div className="font-mono font-bold text-cyan-300 text-[11px] sm:text-xs mt-0.5">{formatUSD(earned)}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase truncate">Paid Out</div>
                  <div className="font-mono font-bold text-amber-300 text-[11px] sm:text-xs mt-0.5">{formatUSD(paid)}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase truncate">Remaining</div>
                  <div className={`font-mono font-bold text-[11px] sm:text-xs mt-0.5 ${quotaAchieved ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {formatUSD(remainingBalance)}
                  </div>
                </div>
              </div>

              {/* Status explanation */}
              <div className="mt-2 px-1 text-[10px] sm:text-[11px]">
                {quotaAchieved ? (
                  <span className="text-emerald-400 font-medium">
                    ✅ $40 Target secured! Worker surplus: <strong>{formatUSD(workerSurplus)}</strong>
                  </span>
                ) : (
                  <span className="text-amber-400/90 font-medium">
                    ⚠️ Needs <strong>{formatUSD(remainingToHitTarget)}</strong> more net balance to hit $40
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                  <button
                    onClick={() => onOpenWithdrawalForDevice(device)}
                    className="btn btn-secondary btn-sm flex-1 sm:flex-initial text-xs py-1.5 px-2.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20 active:scale-95"
                    title="Add survey withdrawal for this device"
                  >
                    <Plus className="w-3 h-3" /> Withdraw
                  </button>
                  <button
                    onClick={() => onOpenPaymentForDevice(device)}
                    className="btn btn-secondary btn-sm flex-1 sm:flex-initial text-xs py-1.5 px-2.5 bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 active:scale-95"
                    title="Pay worker advance / payout"
                  >
                    <MinusCircle className="w-3 h-3" /> Pay
                  </button>
                </div>

                <button
                  onClick={() => onExportWorkerPDF(device)}
                  className="btn btn-secondary btn-sm text-xs py-1.5 px-2.5 text-slate-300 hover:text-white active:scale-95 ml-auto"
                  title="Export individual statement as PDF"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Statement PDF</span>
                  <span className="sm:hidden">Statement</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-8 sm:py-10 text-slate-400">
          <Smartphone className="w-9 h-9 sm:w-10 sm:h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No devices found</p>
          <p className="text-xs text-slate-500 mt-1">Try another search or click "Add Device" to register a new serial number.</p>
        </div>
      )}

    </div>
  );
}
