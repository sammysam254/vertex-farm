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
    <div className="glass-panel p-5 mb-6">
      
      {/* Table Header & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial, worker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-9 py-1.5 text-xs rounded-lg"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select py-1.5 text-xs rounded-lg w-auto text-slate-300"
          >
            <option value="all">All Devices</option>
            <option value="active">Active Only</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Devices Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          const target = Number(device.weekly_target_usd || 40);
          const quotaAchieved = earned >= target;
          const quotaPercent = Math.min(100, Math.round((earned / target) * 100));
          const grossSurplus = Math.max(0, earned - target);
          const workerBalance = grossSurplus - paid;
          const isTerminated = device.worker_status === 'terminated';

          return (
            <div 
              key={device.id || device.serial_number}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isTerminated 
                  ? 'bg-slate-900/40 border-rose-500/20 opacity-70' 
                  : quotaAchieved
                    ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900/70 border-white/10 hover:border-cyan-500/40'
              }`}
            >
              {/* Card Top: Serial, Model & Worker */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    quotaAchieved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {device.serial_number.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white tracking-wide">
                        {device.serial_number}
                      </span>
                      {isTerminated ? (
                        <span className="badge badge-danger text-[10px] py-0.5">
                          Terminated
                        </span>
                      ) : quotaAchieved ? (
                        <span className="badge badge-success text-[10px] py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> $40 Met
                        </span>
                      ) : (
                        <span className="badge badge-warning text-[10px] py-0.5">
                          {formatUSD(target - earned)} left
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{device.device_model || 'Android Phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Worker Button */}
                <button
                  onClick={() => onEditDevice(device)}
                  className="btn btn-secondary btn-sm p-1.5 text-slate-400 hover:text-white"
                  title="Edit Worker Details / Reassign Serial"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Worker Profile Box */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950/50 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-slate-200">{device.worker_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{device.worker_phone ? device.worker_phone : <em className="text-slate-600">No phone (optional)</em>}</span>
                </div>
              </div>

              {/* Quota Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">
                    Owner Target: <strong className="text-white">$40.00</strong> (Due Sat 23:59)
                  </span>
                  <span className={`font-mono font-bold ${quotaAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatUSD(earned)} / $40.00
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

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-lg bg-slate-950/40 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Earned</div>
                  <div className="font-mono font-bold text-cyan-300 mt-0.5">{formatUSD(earned)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Paid Out</div>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">{formatUSD(paid)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Worker Bal.</div>
                  <div className={`font-mono font-bold mt-0.5 ${workerBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatUSD(workerBalance)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenWithdrawalForDevice(device)}
                    className="btn btn-secondary btn-sm text-xs py-1 px-2.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                    title="Add survey withdrawal for this device"
                  >
                    <Plus className="w-3 h-3" /> Withdraw
                  </button>
                  <button
                    onClick={() => onOpenPaymentForDevice(device)}
                    className="btn btn-secondary btn-sm text-xs py-1 px-2.5 bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                    title="Pay worker advance / payout"
                  >
                    <MinusCircle className="w-3 h-3" /> Pay
                  </button>
                </div>

                <button
                  onClick={() => onExportWorkerPDF(device)}
                  className="btn btn-secondary btn-sm text-xs py-1 px-2.5 text-slate-300 hover:text-white"
                  title="Export individual statement as PDF"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>Statement PDF</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Smartphone className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No devices found</p>
          <p className="text-xs text-slate-500 mt-1">Try another search or click "Add Device" to register a new serial number.</p>
        </div>
      )}

    </div>
  );
}
