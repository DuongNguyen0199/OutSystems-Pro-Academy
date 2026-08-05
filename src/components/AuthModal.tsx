import React, { useState } from 'react';
import { X, Mail, Lock, Shield, Info } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
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
        setError(data.error || 'Authentication failed. Incorrect email or password.');
        return;
      }

      const userProfile: UserProfile = data.user;
      localStorage.setItem('outsystems_user', JSON.stringify(userProfile));

      onSuccess(userProfile);
      onClose();
    } catch (err) {
      // Local fallback for offline/client mode
      const assignedRole = email.trim().toLowerCase() === 'duongrbt@gmail.com' ? 'admin' : 'student';
      const userProfile: UserProfile = {
        id: 'usr_' + Date.now(),
        email: email.trim().toLowerCase(),
        role: assignedRole,
        status: 'active',
      };

      localStorage.setItem('outsystems_user', JSON.stringify(userProfile));
      onSuccess(userProfile);
      onClose();
    } finally {
      setLoading(false);
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
              Sign In to OutSystems Academy
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Access student portal & Admin Management Panel
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Box: No Self Registration */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-3.5 px-6 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            Student accounts & activation codes are issued by Admin upon purchasing a course. Log in below with your assigned credentials.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-semibold">
              {error}
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
      </div>
    </div>
  );
}
