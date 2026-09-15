import React, { useState } from 'react';
import { X, Gift, Check, Mail, ExternalLink, Info, Copy, CheckCircle2 } from 'lucide-react';

interface VouchersModalProps {
  onClose: () => void;
}

export default function VouchersModal({ onClose }: VouchersModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('duongrbt@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      {/* Click backdrop to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />
      
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-tight leading-tight flex items-center gap-2">
                Prometric Exam Vouchers
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Official
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">OutSystems Official Certification Vouchers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Important Distinction Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed font-medium">
              <span className="font-bold text-amber-900">What are these vouchers?</span>
              <p className="mt-0.5 text-[11.5px]">
                These are official discount voucher codes used when registering on the{' '}
                <strong className="font-bold text-slate-900">Prometric OutSystems Certification Portal</strong>{' '}
                (not for course purchases on this website).
              </p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="font-display font-bold text-sm sm:text-base text-slate-900">
              Save Big on Your Official Certification Exam!
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Limited OutSystems Prometric Vouchers Available
            </p>
          </div>

          {/* Voucher Options Grid */}
          <div className="space-y-3">
            {/* Voucher 1: 100% OFF */}
            <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/40 flex items-start gap-3 shadow-2xs relative overflow-hidden group">
              <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-sans font-bold text-sm text-slate-900 leading-tight">
                    100% Discount Voucher
                  </h5>
                  <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-md uppercase">
                    FREE EXAM
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-normal">
                  Fully waives the official Prometric OutSystems certification exam registration fee ($100 - $200+ value).
                </p>
              </div>
            </div>

            {/* Voucher 2: 50% OFF */}
            <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/40 flex items-start gap-3 shadow-2xs relative overflow-hidden group">
              <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-sans font-bold text-sm text-slate-900 leading-tight">
                    50% Discount Voucher
                  </h5>
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase">
                    HALF PRICE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-normal">
                  Cuts official Prometric OutSystems exam fees in half for O11 & ODC certifications.
                </p>
              </div>
            </div>
          </div>

          {/* How it Works / Steps */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>How to Claim & Use Your Voucher:</span>
            </h5>
            <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
              <li>Contact us directly before registering your exam on Prometric.</li>
              <li>Receive your verified official OutSystems Prometric Voucher Code.</li>
              <li>Enter the voucher code at checkout on the Prometric OutSystems registration portal.</li>
            </ol>
          </div>

          {/* Contact Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 text-white text-center space-y-3 shadow-md">
            <p className="text-xs font-semibold text-slate-200 leading-snug">
              Contact us to claim or inquire about voucher availability:
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <a 
                href="mailto:duongrbt@gmail.com?subject=Inquiry%20about%20OutSystems%20Prometric%20Exam%20Voucher"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email (duongrbt@gmail.com)</span>
              </a>

              <button
                onClick={handleCopyEmail}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer border border-slate-600"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <a 
              href="https://proscheduler.prometric.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
            >
              <span>Go to Official Prometric OutSystems Registration Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex shrink-0 justify-end">
          <button 
            onClick={onClose}
            className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
