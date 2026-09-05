import React, { useState } from 'react';
import { X, Mail, Lock, Shield, Info, AlertCircle, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Invalid email or password.');
        return;
      }

      // Check if Admin 2FA OTP is required
      if (data.requiresOtp) {
        setRequiresOtp(true);
        setStatusMsg(data.message || 'Mật khẩu chính xác! Mã xác thực Admin OTP 6 chữ số đã được gửi tự động tới Email duongrbt@gmail.com & Telegram.');
        return;
      }

      // Student direct login
      const userProfile: UserProfile = data.user;
      localStorage.setItem('outsystems_user', JSON.stringify(userProfile));

      onSuccess(userProfile);
      onClose();
    } catch (err) {
      setError('Could not connect to authentication server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Mã OTP không chính xác hoặc đã hết hạn.');
        return;
      }

      const userProfile: UserProfile = data.user;
      localStorage.setItem('outsystems_user', JSON.stringify(userProfile));

      onSuccess(userProfile);
      onClose();
    } catch (err) {
      setError('Không thể kết nối máy chủ để xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setStatusMsg('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || 'Đã gửi lại mã OTP mới tới Email & Telegram!');
      } else {
        setError(data.error || 'Không thể gửi lại mã OTP.');
      }
    } catch (err) {
      setError('Lỗi kết nối khi gửi lại OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              {requiresOtp ? 'Admin 2FA Security Verification' : 'Sign In to OutSystems Academy'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {requiresOtp ? 'Xác thực 2 lớp dành cho tài khoản Admin' : 'Access student portal & Admin Command Center'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Box */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-3.5 px-6 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {requiresOtp 
              ? 'Xác thực OTP: Vui lòng kiểm tra hộp thư Email hoặc thông báo Telegram của Admin để lấy mã 6 chữ số.' 
              : 'Accounts are provisioned by Administrator. Please log in with your assigned email and password.'}
          </p>
        </div>

        {/* Form Body */}
        {!requiresOtp ? (
          /* Step 1: Email & Password Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-xs md:text-sm text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-xs md:text-sm text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs md:text-sm shadow-sm transition-all cursor-pointer mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Step 2: Admin 2FA OTP Form */
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            {statusMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 font-semibold flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{statusMsg}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Nhập Mã Xác Thực Admin OTP (6 Chữ Số)</span>
                <span className="text-[10px] text-purple-600 font-bold">5 Phút Hiệu Lực</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 pl-10 text-center font-mono font-bold text-xl tracking-[6px] text-emerald-400 outline-none focus:border-emerald-500"
                />
                <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setRequiresOtp(false);
                  setError('');
                  setStatusMsg('');
                }}
                className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Gửi lại...' : 'Gửi lại mã OTP'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl text-xs md:text-sm shadow-md transition-all cursor-pointer mt-2"
            >
              {loading ? 'Verifying OTP...' : 'Xác Thực OTP & Về Trang Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
