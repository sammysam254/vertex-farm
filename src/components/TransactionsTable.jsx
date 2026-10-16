import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Filter, 
  Search, 
  Layers, 
  Calendar,
  CheckCircle,
  Tag
} from 'lucide-react';
import { formatUSD, formatDatePretty } from '../utils/dateUtils';

export function TransactionsTable({
  withdrawals,
  payments,
  onDeleteTransaction
}) {
  const [filterType, setFilterType] = useState('all'); // all | withdrawal | payment
  const [searchTerm, setSearchTerm] = useState('');

  // Merge and sort transactions by date descending
  const mergedTx = [
    ...withdrawals.map(w => ({
      ...w,
      txType: 'withdrawal',
      typeLabel: 'WITHDRAWAL',
      isIncome: true
    })),
    ...payments.map(p => ({
      ...p,
      txType: 'payment',
      typeLabel: 'WORKER PAYMENT',
      isIncome: false
    }))
  ].sort((a, b) => new Date(b.withdrawal_date || b.payment_date || b.created_at) - new Date(a.withdrawal_date || a.payment_date || a.created_at));

  const filtered = mergedTx.filter(tx => {
    if (filterType !== 'all' && tx.txType !== filterType) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.device_serial?.toLowerCase().includes(term) ||
      tx.worker_name?.toLowerCase().includes(term) ||
      tx.platform?.toLowerCase().includes(term) ||
      tx.notes?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="glass-panel p-5 mb-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Live Revenue & Payout Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed updating Income Pool, Paid Pool, and Net Profit
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search serial, worker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-8 py-1.5 text-xs rounded-lg"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select py-1.5 text-xs rounded-lg w-auto text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="withdrawal">Withdrawals Only</option>
            <option value="payment">Paid to Workers</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3 px-4">Date & Day</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Device Serial</th>
              <th className="py-3 px-4">Worker</th>
              <th className="py-3 px-4">Platform / Notes</th>
              <th className="py-3 px-4 text-right">Amount (USD)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                
                {/* Date */}
                <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDatePretty(tx.withdrawal_date || tx.payment_date)}</span>
                  </div>
                </td>

                {/* Type Badge */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {tx.isIncome ? (
                    <span className="badge badge-cyan text-[11px] py-0.5">
                      <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
                      Withdrawal (+Income)
                    </span>
                  ) : (
                    <span className="badge badge-warning text-[11px] py-0.5">
                      <ArrowUpRight className="w-3 h-3 text-amber-400" />
                      Paid (-Worker)
                    </span>
                  )}
                </td>

                {/* Serial */}
                <td className="py-3 px-4 font-mono font-bold text-slate-200">
                  {tx.device_serial}
                </td>

                {/* Worker */}
                <td className="py-3 px-4 font-semibold text-slate-300">
                  {tx.worker_name}
                </td>

                {/* Platform / Notes */}
                <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                  <span className="text-slate-300 font-medium">{tx.platform || tx.payment_method || 'Surveys'}</span>
                  {tx.notes && <span className="text-slate-500 ml-2">({tx.notes})</span>}
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                  {tx.isIncome ? (
                    <span className="text-cyan-400 text-sm">+{formatUSD(tx.amount_usd)}</span>
                  ) : (
                    <span className="text-amber-400 text-sm">-{formatUSD(tx.amount_usd)}</span>
                  )}
                </td>

                {/* Delete */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete this ${tx.txType} of ${formatUSD(tx.amount_usd)}?`)) {
                        onDeleteTransaction(tx.txType, tx.id);
                      }
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-xs">No ledger entries match this criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
}
