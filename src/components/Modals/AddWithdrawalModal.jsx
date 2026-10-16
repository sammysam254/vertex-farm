import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Check, DollarSign, Smartphone, Calendar, Tag } from 'lucide-react';
import { formatUSD } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

export function AddWithdrawalModal({
  isOpen,
  onClose,
  devices,
  activeWeekId,
  selectedDevice,
  withdrawals,
  onSave
}) {
  const [deviceId, setDeviceId] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState('Freecash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedDevice) {
      setDeviceId(selectedDevice.id);
    } else if (devices.length > 0 && !deviceId) {
      setDeviceId(devices[0].id);
    }
  }, [selectedDevice, devices]);

  if (!isOpen) return null;

  const currentDev = devices.find(d => d.id === deviceId);
  const existingDevWithdrawals = withdrawals.filter(
    w => w.device_id === deviceId || (currentDev && w.device_serial === currentDev.serial_number)
  );
  const currentEarned = existingDevWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
  const target = Number(currentDev?.weekly_target_usd || 40);
  const newProjectedEarned = currentEarned + (Number(amountUsd) || 0);
  const willCrossTarget = currentEarned < target && newProjectedEarned >= target;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountUsd);
    if (!amount || amount <= 0) {
      alert('Please enter a valid USD withdrawal amount.');
      return;
    }
    if (!currentDev) {
      alert('Please select a device.');
      return;
    }

    onSave({
      device_id: currentDev.id,
      device_serial: currentDev.serial_number,
      worker_name: currentDev.worker_name,
      amount_usd: amount,
      withdrawal_date: withdrawalDate,
      week_cycle_id: activeWeekId,
      platform: platform.trim(),
      notes: notes.trim()
    });

    if (willCrossTarget) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    setAmountUsd('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Survey Withdrawal</h3>
              <p className="text-xs text-slate-400">Instantly credited to the Income Pool</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Device Selection */}
          <div className="form-group">
            <label className="form-label">Select Device / Worker</label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="form-select font-mono text-sm"
              required
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.serial_number} — {d.worker_name} {d.worker_phone ? `(${d.worker_phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Amount USD */}
          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span>Amount Withdrawn (USD)</span>
              <span className="text-xs text-cyan-400 font-mono">Increases Income Pool</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-base">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                className="form-input pl-8 text-lg font-mono font-bold text-white"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Date & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 form-group">
            <div>
              <label className="form-label">Withdrawal Date</label>
              <input
                type="date"
                value={withdrawalDate}
                onChange={(e) => setWithdrawalDate(e.target.value)}
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="form-label">Survey Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="form-select text-xs"
              >
                <option value="Freecash">Freecash</option>
                <option value="AttaPoll">AttaPoll</option>
                <option value="Swagbucks">Swagbucks</option>
                <option value="SurveyJunkie">SurveyJunkie</option>
                <option value="Qmee">Qmee</option>
                <option value="Prime Opinion">Prime Opinion</option>
                <option value="Other">Other Survey Provider</option>
              </select>
            </div>
          </div>

          {/* Target Impact Live Preview */}
          {currentDev && (
            <div className="p-3 rounded-lg bg-slate-900 border border-white/10 mb-4 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Current Device Total:</span>
                <span className="font-mono font-bold text-slate-200">{formatUSD(currentEarned)} / $40</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>New Total After Deposit:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {formatUSD(newProjectedEarned)}
                </span>
              </div>
              {willCrossTarget && (
                <div className="mt-2 text-emerald-400 font-semibold flex items-center gap-1.5">
                  🎉 This withdrawal satisfies the $40 owner target for this week!
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Completed high-paying game offer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check className="w-4 h-4" /> Save Withdrawal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
