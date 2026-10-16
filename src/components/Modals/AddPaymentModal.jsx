import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Check, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { formatUSD } from '../../utils/dateUtils';

export function AddPaymentModal({
  isOpen,
  onClose,
  devices,
  activeWeekId,
  selectedDevice,
  withdrawals,
  payments,
  onSave
}) {
  const [deviceId, setDeviceId] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money / M-Pesa');
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
  const devWithdrawals = withdrawals.filter(
    w => w.device_id === deviceId || (currentDev && w.device_serial === currentDev.serial_number)
  );
  const devPayments = payments.filter(
    p => p.device_id === deviceId || (currentDev && p.device_serial === currentDev.serial_number)
  );

  const totalEarned = devWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
  const alreadyPaid = devPayments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0);
  const currentRemaining = totalEarned - alreadyPaid;
  const target = Number(currentDev?.weekly_target_usd || 40.00);
  const targetReached = currentRemaining >= target;
  const eligibleSurplus = Math.max(0, currentRemaining - target);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountUsd);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    if (!currentDev) {
      alert('Please select a device/worker.');
      return;
    }

    onSave({
      device_id: currentDev.id,
      device_serial: currentDev.serial_number,
      worker_name: currentDev.worker_name,
      amount_usd: amount,
      payment_date: paymentDate,
      week_cycle_id: activeWeekId,
      payment_method: paymentMethod.trim(),
      notes: notes.trim()
    });

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
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Worker Payout / Advance</h3>
              <p className="text-xs text-slate-400">Added to Paid Pool and deducted from Net Profit</p>
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
            <label className="form-label">Select Worker / Device Serial</label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="form-select font-mono text-sm"
              required
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.worker_name} — {d.serial_number} {d.worker_phone ? `(${d.worker_phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* $40 Target Check Card */}
          {currentDev && (
            <div className={`p-3.5 rounded-xl border mb-4 text-xs ${
              targetReached 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-start gap-2.5">
                {targetReached ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {targetReached ? '$40 Owner Target Secured (Net Balance)' : 'Warning: $40 Target Not Met Yet'}
                  </div>
                  <div className="mt-1 text-slate-300">
                    Earned: <strong className="text-white font-mono">{formatUSD(totalEarned)}</strong> | Paid: <strong className="text-amber-300 font-mono">{formatUSD(alreadyPaid)}</strong>
                  </div>
                  <div className="mt-1 text-slate-300">
                    Remaining Net Balance: <strong className={`font-mono ${targetReached ? 'text-emerald-300' : 'text-amber-300'}`}>{formatUSD(currentRemaining)}</strong> / $40.00
                  </div>
                  {!targetReached && (
                    <div className="mt-1.5 text-amber-300 font-medium">
                      ⚠️ Needs <strong>{formatUSD(target - currentRemaining)}</strong> more net balance before Saturday 23:59 to guarantee your $40 weekly share.
                    </div>
                  )}
                  {targetReached && (
                    <div className="mt-1 text-emerald-300">
                      Eligible worker surplus balance: <strong className="font-mono text-white">{formatUSD(eligibleSurplus)}</strong> (after $40 owner target).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Amount USD */}
          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span>Amount Paid to Worker (USD)</span>
              <span className="text-xs text-amber-400 font-mono">Increases Paid Pool</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-base">$</span>
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

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 form-group">
            <div>
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="form-label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-select text-xs"
              >
                <option value="Mobile Money / M-Pesa">Mobile Money / M-Pesa</option>
                <option value="Cash Handout">Cash Handout</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Crypto (USDT / LTC)">Crypto (USDT / LTC)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Mid-week grocery advance, Sunday settlement"
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
            <button type="submit" className="btn btn-primary bg-amber-600 hover:bg-amber-500">
              <Check className="w-4 h-4" /> Confirm Payment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
