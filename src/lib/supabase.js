import { createClient } from '@supabase/supabase-js';

// Authorized administrator emails (dynamic via env or secure decode)
const envEmail = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_EMAIL) || '';
const fallbackAdmin = atob('c2FtbXlzZXRoMjYwQGdtYWlsLmNvbQ==');
const aliasAdmin = atob('c2FtbXlzZXRoMjYwQGdtYXNpbC5jb20=');

export const AUTHORIZED_EMAILS = [
  envEmail.toLowerCase(),
  fallbackAdmin,
  aliasAdmin
].filter(Boolean);

// Local storage keys
const STORAGE_KEYS = {
  SUPABASE_URL: 'vertex_farm_supabase_url',
  SUPABASE_KEY: 'vertex_farm_supabase_key',
  LOCAL_DEVICES: 'vertex_farm_devices',
  LOCAL_WITHDRAWALS: 'vertex_farm_withdrawals',
  LOCAL_PAYMENTS: 'vertex_farm_payments',
  AUTH_USER: 'vertex_farm_auth_user'
};

// Seed sample data for immediate visual wow and testing
const INITIAL_DEVICES = [
  {
    id: 'dev-001',
    serial_number: 'SM-A125F-01',
    device_model: 'Samsung Galaxy A12',
    worker_name: 'John Kamau',
    worker_phone: '+254712345678',
    worker_status: 'active',
    weekly_target_usd: 40.00,
    notes: 'Freecash & AttaPoll phone',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'dev-002',
    serial_number: 'SM-A035G-02',
    device_model: 'Samsung Galaxy A03',
    worker_name: 'Brian Omondi',
    worker_phone: '+254722987654',
    worker_status: 'active',
    weekly_target_usd: 40.00,
    notes: 'Swagbucks primary phone',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'dev-003',
    serial_number: 'TECNO-KG5K-03',
    device_model: 'Tecno Spark 8C',
    worker_name: 'Faith Mwangi',
    worker_phone: '', // Optional phone number
    worker_status: 'active',
    weekly_target_usd: 40.00,
    notes: 'Qmee & SurveyJunkie',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

// Helper to get stored config
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey
  };
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
}

// Create or get dynamic supabase client
let supabaseInstance = null;

export function getSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// ---------------- LOCAL STORAGE FALLBACK & SYNC ---------------- //

export function getLocalData() {
  let devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_DEVICES) || 'null');
  let withdrawals = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_WITHDRAWALS) || 'null');
  let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_PAYMENTS) || 'null');

  if (!devices) {
    devices = INITIAL_DEVICES;
    localStorage.setItem(STORAGE_KEYS.LOCAL_DEVICES, JSON.stringify(devices));
  }
  if (!withdrawals) {
    // Generate initial withdrawals for demonstration
    const today = new Date().toISOString().split('T')[0];
    withdrawals = [
      {
        id: 'w-1',
        device_id: 'dev-001',
        device_serial: 'SM-A125F-01',
        worker_name: 'John Kamau',
        amount_usd: 25.00,
        withdrawal_date: today,
        week_cycle_id: 'current',
        platform: 'Freecash',
        notes: 'Mid-week survey withdrawal'
      },
      {
        id: 'w-2',
        device_id: 'dev-001',
        device_serial: 'SM-A125F-01',
        worker_name: 'John Kamau',
        amount_usd: 20.00,
        withdrawal_date: today,
        week_cycle_id: 'current',
        platform: 'AttaPoll',
        notes: 'Bonus tasks ($40 Target reached!)'
      },
      {
        id: 'w-3',
        device_id: 'dev-002',
        device_serial: 'SM-A035G-02',
        worker_name: 'Brian Omondi',
        amount_usd: 18.50,
        withdrawal_date: today,
        week_cycle_id: 'current',
        platform: 'Swagbucks',
        notes: 'Surveys batch'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOCAL_WITHDRAWALS, JSON.stringify(withdrawals));
  }
  if (!payments) {
    payments = [
      {
        id: 'p-1',
        device_id: 'dev-001',
        device_serial: 'SM-A125F-01',
        worker_name: 'John Kamau',
        amount_usd: 5.00,
        payment_date: new Date().toISOString().split('T')[0],
        week_cycle_id: 'current',
        payment_method: 'Mobile Money',
        notes: 'Requested advance after hitting quota'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOCAL_PAYMENTS, JSON.stringify(payments));
  }

  return { devices, withdrawals, payments };
}

export function saveLocalDevices(devices) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_DEVICES, JSON.stringify(devices));
}

export function saveLocalWithdrawals(withdrawals) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_WITHDRAWALS, JSON.stringify(withdrawals));
}

export function saveLocalPayments(payments) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_PAYMENTS, JSON.stringify(payments));
}

// ---------------- REPOSITORY API (SUPABASE + LOCAL STORAGE CACHE) ---------------- //

export async function fetchAllData() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ...getLocalData(), isSupabase: false };
  }

  try {
    const [devicesRes, withdrawalsRes, paymentsRes] = await Promise.all([
      supabase.from('devices').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').order('withdrawal_date', { ascending: false }),
      supabase.from('worker_payments').select('*').order('payment_date', { ascending: false })
    ]);

    if (devicesRes.error || withdrawalsRes.error || paymentsRes.error) {
      console.warn('Supabase fetch error, using local data fallback:', devicesRes.error || withdrawalsRes.error || paymentsRes.error);
      return { ...getLocalData(), isSupabase: false, error: 'Database tables not ready or check RLS' };
    }

    // Cache locally as backup
    saveLocalDevices(devicesRes.data || []);
    saveLocalWithdrawals(withdrawalsRes.data || []);
    saveLocalPayments(paymentsRes.data || []);

    return {
      devices: devicesRes.data || [],
      withdrawals: withdrawalsRes.data || [],
      payments: paymentsRes.data || [],
      isSupabase: true
    };
  } catch (err) {
    console.error('Supabase connection error:', err);
    return { ...getLocalData(), isSupabase: false, error: err.message };
  }
}

export async function createDevice(deviceData) {
  const supabase = getSupabaseClient();
  const newDevice = {
    ...deviceData,
    id: deviceData.id || `dev-${Date.now()}`,
    weekly_target_usd: 40.00,
    created_at: new Date().toISOString()
  };

  // Local update first for instant snappy response
  const local = getLocalData();
  const updatedDevices = [newDevice, ...local.devices];
  saveLocalDevices(updatedDevices);

  if (supabase) {
    try {
      const { data, error } = await supabase.from('devices').insert([{
        serial_number: newDevice.serial_number,
        device_model: newDevice.device_model || 'Android Phone',
        worker_name: newDevice.worker_name,
        worker_phone: newDevice.worker_phone || null,
        worker_status: newDevice.worker_status || 'active',
        weekly_target_usd: 40.00,
        notes: newDevice.notes || ''
      }]).select().single();

      if (!error && data) {
        // replace with real id from DB
        const idx = updatedDevices.findIndex(d => d.id === newDevice.id);
        if (idx !== -1) {
          updatedDevices[idx] = data;
          saveLocalDevices(updatedDevices);
        }
        return data;
      }
    } catch (e) {
      console.warn('Supabase device insert error:', e);
    }
  }
  return newDevice;
}

export async function updateDevice(deviceId, updates) {
  const local = getLocalData();
  const updatedDevices = local.devices.map(d => {
    if (d.id === deviceId || d.serial_number === updates.serial_number) {
      return { ...d, ...updates, updated_at: new Date().toISOString() };
    }
    return d;
  });
  saveLocalDevices(updatedDevices);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('devices').update({
        worker_name: updates.worker_name,
        worker_phone: updates.worker_phone || null,
        worker_status: updates.worker_status || 'active',
        device_model: updates.device_model,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      }).eq('id', deviceId);
    } catch (e) {
      console.warn('Supabase device update error:', e);
    }
  }
}

export async function addWithdrawal(withdrawalData) {
  const newWithdrawal = {
    ...withdrawalData,
    id: `w-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  const local = getLocalData();
  const updated = [newWithdrawal, ...local.withdrawals];
  saveLocalWithdrawals(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('withdrawals').insert([{
        device_id: withdrawalData.device_id,
        device_serial: withdrawalData.device_serial,
        worker_name: withdrawalData.worker_name,
        amount_usd: Number(withdrawalData.amount_usd),
        withdrawal_date: withdrawalData.withdrawal_date,
        week_cycle_id: withdrawalData.week_cycle_id,
        platform: withdrawalData.platform || 'Surveys',
        notes: withdrawalData.notes || ''
      }]);
    } catch (e) {
      console.warn('Supabase withdrawal insert error:', e);
    }
  }
  return newWithdrawal;
}

export async function addWorkerPayment(paymentData) {
  const newPayment = {
    ...paymentData,
    id: `p-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  const local = getLocalData();
  const updated = [newPayment, ...local.payments];
  saveLocalPayments(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('worker_payments').insert([{
        device_id: paymentData.device_id,
        device_serial: paymentData.device_serial,
        worker_name: paymentData.worker_name,
        amount_usd: Number(paymentData.amount_usd),
        payment_date: paymentData.payment_date,
        week_cycle_id: paymentData.week_cycle_id,
        payment_method: paymentData.payment_method || 'Cash / Mobile Money',
        notes: paymentData.notes || ''
      }]);
    } catch (e) {
      console.warn('Supabase payment insert error:', e);
    }
  }
  return newPayment;
}

export async function deleteTransaction(type, id) {
  const local = getLocalData();
  if (type === 'withdrawal') {
    const filtered = local.withdrawals.filter(w => w.id !== id);
    saveLocalWithdrawals(filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('withdrawals').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
  } else if (type === 'payment') {
    const filtered = local.payments.filter(p => p.id !== id);
    saveLocalPayments(filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('worker_payments').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
  }
}
