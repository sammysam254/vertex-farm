import React, { useState } from 'react';
import { X, Smartphone, User, Phone, Check } from 'lucide-react';

export function AddDeviceModal({ isOpen, onClose, onSave }) {
  const [serialNumber, setSerialNumber] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serialNumber.trim() || !workerName.trim()) {
      alert('Please provide both Device Serial Number and Worker Name.');
      return;
    }

    onSave({
      serial_number: serialNumber.trim().toUpperCase(),
      worker_name: workerName.trim(),
      worker_phone: workerPhone.trim() || '', // Optional
      device_model: deviceModel.trim() || 'Android Phone',
      worker_status: 'active',
      notes: notes.trim()
    });

    // Reset and close
    setSerialNumber('');
    setWorkerName('');
    setWorkerPhone('');
    setDeviceModel('');
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
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Android Device</h3>
              <p className="text-xs text-slate-400">Assign phone serial to a survey worker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Serial Number */}
          <div className="form-group">
            <label className="form-label">
              Device Serial Number <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SM-A125F-04 or IMEI / Serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="form-input font-mono uppercase"
              required
            />
          </div>

          {/* Worker Name */}
          <div className="form-group">
            <label className="form-label">
              Assigned Worker Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Samuel Gitau"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Phone Number (Optional) */}
          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span>Worker Phone Number</span>
              <span className="text-xs text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +254 712 345 678 (optional)"
              value={workerPhone}
              onChange={(e) => setWorkerPhone(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Device Model */}
          <div className="form-group">
            <label className="form-label">Device Model</label>
            <input
              type="text"
              placeholder="e.g. Samsung Galaxy A12 / Tecno / Infinix"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Quota reminder note */}
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/20 mb-4 text-xs text-cyan-300">
            <strong>Weekly Rule:</strong> Each device is automatically configured with the mandatory <strong>$40 USD</strong> weekly target payable before Saturday 23:59.
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check className="w-4 h-4" /> Save Device
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
