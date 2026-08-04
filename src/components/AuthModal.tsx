import React, { useState } from 'react';
import { X, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
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
      setError('Password must be at least 4 characters long.');
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
          role: role,
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
      const assignedRole = email.trim().toLowerCase() === 'duongrbt@gmail.com' ? 'admin' : role;
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
              {isRegister ? 'Create Student Account' : 'Login to Academy'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Access your OutSystems practice tests and activation codes
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'admin')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 px-3 text-xs text-slate-900 outline-none transition-all"
              >
                <option value="student">Student (Learner)</option>
                <option value="admin">Administrator (duongrbt@gmail.com)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRegister ? 'Create Account' : 'Sign In Now'}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : 'Need an account? Register here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
