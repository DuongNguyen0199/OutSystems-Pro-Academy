import React, { useState } from 'react';
import { X, Key, ShieldAlert, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Course, UserProfile } from '../types';

interface ActivationCodeModalProps {
  course: Course;
  user?: UserProfile | null;
  onClose: () => void;
  onSuccess?: (course: Course) => void;
  onSuccessUnlock?: (course: Course) => void;
  onRequestPayment?: () => void;
  onOpenAuthModal?: () => void;
}

export default function ActivationCodeModal({
  course,
  user,
  onClose,
  onSuccess,
  onSuccessUnlock,
  onRequestPayment,
  onOpenAuthModal,
}: ActivationCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const triggerSuccess = () => {
    if (onSuccessUnlock) onSuccessUnlock(course);
    if (onSuccess) onSuccess(course);
    onClose();
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) return;

    if (!user || !user.email) {
      setError('Authentication Required: Please log in to your registered account before activating your practice test code.');
      return;
    }

    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter your activation code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmedCode,
          userEmail: user ? user.email : '',
          courseId: course.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid || data.success) {
          triggerSuccess();
          return;
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= 5) {
            setIsLocked(true);
            setError('Code locked! You have exceeded 5 failed attempts. Please contact Admin at duongrbt@gmail.com.');
          } else {
            setError(data.error || data.message || `Invalid activation code for ${course.title}. Attempt ${newAttempts} of 5.`);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('API validate-code call note:', err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Network error validating activation code. Attempt ${newAttempts} of 5.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Enter Activation Code
            </h3>
            <p className="text-xs text-blue-200 mt-1 truncate max-w-xs font-medium">
              {course.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleValidate} className="p-6 space-y-4">
          {!user ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Login Required</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                You must be logged in to activate a course code so it can be bound to your account.
              </p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow cursor-pointer mt-1"
                >
                  Log In / Register Account Now
                </button>
              )}
            </div>
          ) : (
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-normal">Logged in as: </span>
                <strong className="font-bold text-blue-950">{user.email}</strong>
              </div>
              <span className="text-[10px] bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                {user.role}
              </span>
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              isLocked 
                ? 'bg-red-100 border border-red-300 text-red-900 font-bold' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {!isLocked ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Course Activation Code</label>
              <input
                type="text"
                placeholder="e.g. OUT-REACTIVE-90D-8X9A"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 outline-none transition-all uppercase"
                autoFocus
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Maximum 5 attempts allowed</span>
                <span className="font-bold text-slate-600">Failed tries: {attempts}/5</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-600">
                Your activation code is temporarily locked due to multiple incorrect attempts.
              </p>
              <a
                href="mailto:duongrbt@gmail.com"
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Contact Admin (duongrbt@gmail.com)
              </a>
            </div>
          )}

          {!isLocked && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Code & Start Exam</span>
                </>
              )}
            </button>
          )}

          <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Don't have a code yet?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestPayment();
              }}
              className="font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Request Access Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
