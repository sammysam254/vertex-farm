import React, { useState, useEffect } from 'react';
import { X, Edit3, User, Phone, Check, UserX, AlertTriangle } from 'lucide-react';

export function EditWorkerModal({ isOpen, onClose, device, onUpdate }) {
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerStatus, setWorkerStatus] = useState('active');
  const [deviceModel, setDeviceModel] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (device) {
      setWorkerName(device.worker_name || '');
      setWorkerPhone(device.worker_phone || '');
      setWorkerStatus(device.worker_status || 'active');
      setDeviceModel(device.device_model || '');
      setNotes(device.notes || '');
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workerName.trim()) {
      alert('Worker name is required.');
      return;
    }

    onUpdate(device.id, {
      serial_number: device.serial_number,
      worker_name: workerName.trim(),
      worker_phone: workerPhone.trim() || '',
      worker_status: workerStatus,
      device_model: deviceModel.trim(),
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Device / Worker</h3>
              <p className="text-xs text-slate-400">
                Serial: <span className="font-mono text-cyan-400 font-bold">{device.serial_number}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Worker Status Toggle / Termination */}
          <div className="form-group">
            <label className="form-label">Worker Assignment Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWorkerStatus('active')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  workerStatus === 'active'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Active Worker
              </button>
              <button
                type="button"
                onClick={() => setWorkerStatus('terminated')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  workerStatus === 'terminated'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-rose-400'
                }`}
              >
                <UserX className="w-3.5 h-3.5" /> Terminated
              </button>
            </div>
          </div>

          {/* Worker Name */}
          <div className="form-group">
            <label className="form-label">
              Assigned Worker Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="form-input"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              If replacing a worker, simply enter the new worker's name here.
            </span>
          </div>

          {/* Worker Phone */}
          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span>Worker Phone Number</span>
              <span className="text-xs text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={workerPhone}
              onChange={(e) => setWorkerPhone(e.target.value)}
              placeholder="e.g. +254 712 345 678"
              className="form-input"
            />
          </div>

          {/* Device Model */}
          <div className="form-group">
            <label className="form-label">Device Hardware Model</label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Termination Reason</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handed over phone to new operator on Tuesday..."
              className="form-textarea text-xs"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check className="w-4 h-4" /> Update Serial Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
