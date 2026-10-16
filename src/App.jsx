import React, { useState, useEffect } from 'react';
import { 
  getCurrentWeekCycle, 
  getPastWeeksList 
} from './utils/dateUtils';
import { 
  fetchAllData, 
  createDevice, 
  updateDevice, 
  addWithdrawal, 
  addWorkerPayment, 
  deleteTransaction,
  getSupabaseConfig
} from './lib/supabase';
import { 
  generateFarmSummaryPDF, 
  generateWorkerStatementPDF 
} from './utils/pdfGenerator';

import { AuthGate } from './components/AuthGate';
import { Header } from './components/Header';
import { PoolCards } from './components/PoolCards';
import { DeviceList } from './components/DeviceList';
import { TransactionsTable } from './components/TransactionsTable';

import { AddDeviceModal } from './components/Modals/AddDeviceModal';
import { EditWorkerModal } from './components/Modals/EditWorkerModal';
import { AddWithdrawalModal } from './components/Modals/AddWithdrawalModal';
import { AddPaymentModal } from './components/Modals/AddPaymentModal';
import { SupabaseSettingsModal } from './components/Modals/SupabaseSettingsModal';

export function App() {
  // Authentication state
  const [adminUser, setAdminUser] = useState(() => {
    return localStorage.getItem('vertex_farm_admin_email') || null;
  });

  // Week cycle state
  const [pastWeeks] = useState(() => getPastWeeksList(10));
  const [selectedWeek, setSelectedWeek] = useState(() => getCurrentWeekCycle());

  // Data states
  const [devices, setDevices] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showEditDevice, setShowEditDevice] = useState(null);
  const [showAddWithdrawal, setShowAddWithdrawal] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [activeDeviceForAction, setActiveDeviceForAction] = useState(null);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    const result = await fetchAllData();
    setDevices(result.devices || []);
    setWithdrawals(result.withdrawals || []);
    setPayments(result.payments || []);
    setIsSupabaseConnected(result.isSupabase || false);
    setLoading(false);
  };

  useEffect(() => {
    if (adminUser) {
      loadData();
    }
  }, [adminUser]);

  // If not authenticated as authorized master admin, show AuthGate
  if (!adminUser) {
    return <AuthGate onAuthorized={(email) => setAdminUser(email)} />;
  }

  // Filter withdrawals and payments by selected week
  // (or if week_cycle_id is 'current', include it in current week)
  const isSelectedCurrent = selectedWeek.isCurrentWeek;
  
  const weekWithdrawals = withdrawals.filter(w => {
    if (w.week_cycle_id === selectedWeek.id) return true;
    if (isSelectedCurrent && (!w.week_cycle_id || w.week_cycle_id === 'current')) return true;
    // Check if withdrawal_date falls within week cycle
    if (w.withdrawal_date) {
      const d = new Date(w.withdrawal_date);
      return d >= selectedWeek.startDate && d <= selectedWeek.endDate;
    }
    return false;
  });

  const weekPayments = payments.filter(p => {
    if (p.week_cycle_id === selectedWeek.id) return true;
    if (isSelectedCurrent && (!p.week_cycle_id || p.week_cycle_id === 'current')) return true;
    if (p.payment_date) {
      const d = new Date(p.payment_date);
      return d >= selectedWeek.startDate && d <= selectedWeek.endDate;
    }
    return false;
  });

  // Dynamic Pools Calculations
  const totalIncome = weekWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
  const totalPaid = weekPayments.reduce((sum, p) => sum + Number(p.amount_usd || 0), 0);
  const netProfit = totalIncome - totalPaid;

  // Quotas met count
  const targetHitCount = devices.filter(dev => {
    const devWithdrawals = weekWithdrawals.filter(
      w => w.device_serial === dev.serial_number || w.device_id === dev.id
    );
    const earned = devWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);
    return earned >= Number(dev.weekly_target_usd || 40);
  }).length;

  // ---------------- ACTION HANDLERS ---------------- //

  const handleCreateDevice = async (deviceData) => {
    const created = await createDevice(deviceData);
    setDevices(prev => [created, ...prev.filter(d => d.serial_number !== created.serial_number)]);
  };

  const handleUpdateDevice = async (deviceId, updates) => {
    await updateDevice(deviceId, updates);
    setDevices(prev => prev.map(d => (d.id === deviceId ? { ...d, ...updates } : d)));
  };

  const handleAddWithdrawal = async (data) => {
    const newTx = await addWithdrawal(data);
    setWithdrawals(prev => [newTx, ...prev]);
  };

  const handleAddPayment = async (data) => {
    const newTx = await addWorkerPayment(data);
    setPayments(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = async (type, id) => {
    await deleteTransaction(type, id);
    if (type === 'withdrawal') {
      setWithdrawals(prev => prev.filter(w => w.id !== id));
    } else {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  // PDF Export Handlers
  const handleExportAllPDF = () => {
    generateFarmSummaryPDF({
      weekCycle: selectedWeek,
      devices,
      withdrawals: weekWithdrawals,
      payments: weekPayments,
      totalIncome,
      totalPaid,
      netProfit,
      adminEmail: adminUser
    });
  };

  const handleExportWorkerPDF = (device) => {
    const devWithdrawals = weekWithdrawals.filter(
      w => w.device_serial === device.serial_number || w.device_id === device.id
    );
    const devPayments = weekPayments.filter(
      p => p.device_serial === device.serial_number || p.device_id === device.id
    );

    generateWorkerStatementPDF({
      workerName: device.worker_name,
      deviceSerial: device.serial_number,
      workerPhone: device.worker_phone,
      weekCycle: selectedWeek,
      withdrawals: devWithdrawals,
      payments: devPayments,
      adminEmail: adminUser
    });
  };

  return (
    <div className="min-h-screen pb-16">
      
      {/* Navigation Header */}
      <Header
        weekCycle={selectedWeek}
        pastWeeks={pastWeeks}
        onSelectWeek={setSelectedWeek}
        onOpenAddDevice={() => setShowAddDevice(true)}
        onOpenWithdrawal={() => {
          setActiveDeviceForAction(null);
          setShowAddWithdrawal(true);
        }}
        onOpenPayment={() => {
          setActiveDeviceForAction(null);
          setShowAddPayment(true);
        }}
        onExportAllPDF={handleExportAllPDF}
        onOpenSettings={() => setShowSupabaseSettings(true)}
        adminEmail={adminUser}
        onLogout={() => {
          localStorage.removeItem('vertex_farm_admin_email');
          setAdminUser(null);
        }}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Dynamic Financial Pool Cards */}
        <PoolCards
          totalIncome={totalIncome}
          totalPaid={totalPaid}
          netProfit={netProfit}
          targetHitCount={targetHitCount}
          totalDevices={devices.length}
          onOpenWithdrawal={() => {
            setActiveDeviceForAction(null);
            setShowAddWithdrawal(true);
          }}
          onOpenPayment={() => {
            setActiveDeviceForAction(null);
            setShowAddPayment(true);
          }}
        />

        {/* Device Fleet & Worker Management */}
        <DeviceList
          devices={devices}
          withdrawals={weekWithdrawals}
          payments={weekPayments}
          onOpenWithdrawalForDevice={(dev) => {
            setActiveDeviceForAction(dev);
            setShowAddWithdrawal(true);
          }}
          onOpenPaymentForDevice={(dev) => {
            setActiveDeviceForAction(dev);
            setShowAddPayment(true);
          }}
          onEditDevice={(dev) => setShowEditDevice(dev)}
          onExportWorkerPDF={handleExportWorkerPDF}
        />

        {/* Live Transactions Stream */}
        <TransactionsTable
          withdrawals={weekWithdrawals}
          payments={weekPayments}
          onDeleteTransaction={handleDeleteTransaction}
        />

      </main>

      {/* Modals */}
      <AddDeviceModal
        isOpen={showAddDevice}
        onClose={() => setShowAddDevice(false)}
        onSave={handleCreateDevice}
      />

      <EditWorkerModal
        isOpen={!!showEditDevice}
        device={showEditDevice}
        onClose={() => setShowEditDevice(null)}
        onUpdate={handleUpdateDevice}
      />

      <AddWithdrawalModal
        isOpen={showAddWithdrawal}
        onClose={() => {
          setShowAddWithdrawal(false);
          setActiveDeviceForAction(null);
        }}
        devices={devices}
        activeWeekId={selectedWeek.id}
        selectedDevice={activeDeviceForAction}
        withdrawals={weekWithdrawals}
        onSave={handleAddWithdrawal}
      />

      <AddPaymentModal
        isOpen={showAddPayment}
        onClose={() => {
          setShowAddPayment(false);
          setActiveDeviceForAction(null);
        }}
        devices={devices}
        activeWeekId={selectedWeek.id}
        selectedDevice={activeDeviceForAction}
        withdrawals={weekWithdrawals}
        payments={weekPayments}
        onSave={handleAddPayment}
      />

      <SupabaseSettingsModal
        isOpen={showSupabaseSettings}
        onClose={() => setShowSupabaseSettings(false)}
        onConnectedChange={(connected) => setIsSupabaseConnected(connected)}
      />

    </div>
  );
}

export default App;
