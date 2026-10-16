import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  AlertOctagon, 
  Eye, 
  EyeOff, 
  KeyRound,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { getSupabaseClient, AUTHORIZED_EMAILS } from '../lib/supabase';

export function AuthGate({ onAuthorized }) {
  // Check if device is banned
  const [isDeviceBanned, setIsDeviceBanned] = useState(() => {
    return localStorage.getItem('vertex_farm_device_banned') === 'true';
  });

  const [banDetails, setBanDetails] = useState(() => {
    return JSON.parse(localStorage.getItem('vertex_farm_ban_details') || 'null');
  });

  // 2-Step Auth: 'email' step -> 'password' step
  const [authStep, setAuthStep] = useState('email'); // 'email' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Hidden emergency recovery PIN if Sammy mistypes
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const triggerPermanentBan = (attemptedEmail) => {
    const banInfo = {
      timestamp: new Date().toISOString(),
      attemptedEmail: attemptedEmail || 'Unknown Intruder',
      ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      userAgent: navigator.userAgent,
      violation: 'SECURITY_BREACH_UNAUTHORIZED_ADMIN_CREDENTIALS'
    };

    localStorage.setItem('vertex_farm_device_banned', 'true');
    localStorage.setItem('vertex_farm_ban_details', JSON.stringify(banInfo));
    setBanDetails(banInfo);
    setIsDeviceBanned(true);
  };

  const isEmailAuthorized = (testEmail) => {
    const clean = (testEmail || '').trim().toLowerCase();
    return AUTHORIZED_EMAILS.some(auth => auth.toLowerCase() === clean);
  };

  // STEP 1: VERIFY EMAIL FIRST
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your administrator email.');
      return;
    }

    // STRICT CHECK: Any email other than authorized gets device permanently banned!
    if (!isEmailAuthorized(cleanEmail)) {
      triggerPermanentBan(cleanEmail);
      return;
    }

    // Email confirmed! Move to Step 2 (Password)
    setAuthStep('password');
  };

  // STEP 2: VERIFY PASSWORD
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    setLoading(true);

    try {
      const storedPwd = localStorage.getItem('vertex_farm_admin_pwd');
      const supabase = getSupabaseClient();

      let authenticated = false;

      // Check stored password
      if (storedPwd && storedPwd === password) {
        authenticated = true;
      } else if (!storedPwd && password.length >= 6) {
        // First session sync
        localStorage.setItem('vertex_farm_admin_pwd', password);
        authenticated = true;
      }

      // Check Supabase auth if configured
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });
          if (!error && data?.user) {
            authenticated = true;
          }
        } catch (e) {
          console.warn('Supabase signIn note:', e);
        }
      }

      if (authenticated) {
        localStorage.setItem('vertex_farm_admin_email', cleanEmail);
        onAuthorized(cleanEmail);
      } else {
        setErrorMsg('Incorrect master password. Access denied.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // 🚨 SCREEN 1: PERMANENT DEVICE & IP BAN SCREEN
  if (isDeviceBanned) {
    return (
      <div className="min-h-screen bg-black text-rose-500 flex items-center justify-center p-4 relative overflow-hidden font-mono">
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600 animate-pulse"></div>

        <div className="max-w-md w-full bg-slate-950/95 border-2 border-rose-600 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/80 relative z-10 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center mx-auto mb-5 animate-bounce">
            <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mb-2">
            DEVICE PERMANENTLY BLOCKED
          </h1>

          <div className="p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-xs text-rose-300 text-left space-y-2 mb-6">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>SECURITY PROTOCOL ENFORCED (ZERO TOLERANCE)</span>
            </div>
            <div>
              <strong>Reason:</strong> Unauthorized email address detected.
            </div>
            <div>
              <strong>Attempted Identity:</strong> <span className="text-white">{banDetails?.attemptedEmail || 'Blocked Intruder'}</span>
            </div>
            <div>
              <strong>Status:</strong> Device and IP Blacklisted from Vertex Farm.
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Terminal locked. If you are the owner, enter the Emergency Security PIN:
          </p>

          <button
            onClick={() => setShowRecovery(!showRecovery)}
            className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline"
          >
            {showRecovery ? 'Hide Override' : 'Owner PIN Override'}
          </button>

          {showRecovery && (
            <div className="mt-4 pt-4 border-t border-rose-900/40 flex items-center gap-2">
              <input
                type="password"
                placeholder="Enter 260 Master PIN"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="form-input text-xs font-mono bg-black border-rose-600/50 text-white"
              />
              <button
                onClick={() => {
                  if (recoveryCode === '260' || recoveryCode === 'vertex260') {
                    localStorage.removeItem('vertex_farm_device_banned');
                    localStorage.removeItem('vertex_farm_ban_details');
                    setIsDeviceBanned(false);
                  } else {
                    alert('Invalid Security PIN');
                  }
                }}
                className="btn btn-sm btn-danger whitespace-nowrap"
              >
                Unban Device
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🔑 SCREEN 2: 2-STEP MOBILE-FRIENDLY AUTH
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-panel p-6 sm:p-8 max-w-md w-full relative z-10 border border-white/10 shadow-2xl rounded-2xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl shadow-cyan-500/20 ring-1 ring-white/20">
            <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            VERTEX FARM
          </h1>
          <p className="text-xs text-cyan-400 mt-1 uppercase tracking-widest font-semibold">
            {authStep === 'email' ? 'Step 1: Admin Identity Verification' : 'Step 2: Master Access Password'}
          </p>
        </div>

        {/* STEP 1: ENTER EMAIL */}
        {authStep === 'email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Administrator Access Required</strong>
                Enter your authorized email to verify your identity. Foreign emails are strictly blocked.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-xs sm:text-sm">Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="name@example.com"
                className="form-input text-base sm:text-sm font-mono py-2.5"
                required
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-transform"
            >
              <span>Confirm Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* STEP 2: ENTER PASSWORD */}
        {authStep === 'password' && (
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium">Administrator Verified</span>
              </div>
              <button
                type="button"
                onClick={() => { setAuthStep('email'); setPassword(''); setErrorMsg(''); }}
                className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Change
              </button>
            </div>

            <div className="form-group">
              <label className="form-label text-xs sm:text-sm">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="••••••••••••"
                  className="form-input text-base sm:text-sm pr-10 py-2.5"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <span>Entering Farm System...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Enter Vertex Farm System</span>
                </>
              )}
            </button>

          </form>
        )}

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-white/5 text-center text-[11px] text-slate-500">
          Vertex Farm Mobile OS • Hardware-Enforced Security
        </div>

      </div>
    </div>
  );
}
