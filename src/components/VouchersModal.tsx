import React from 'react';
import { X, Gift, Check, Mail } from 'lucide-react';

interface VouchersModalProps {
  onClose: () => void;
}

export default function VouchersModal({ onClose }: VouchersModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      {/* Click backdrop to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />
      
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              OutSystems Vouchers
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="text-center">
            <h4 className="font-display font-bold text-sm sm:text-base text-slate-900">
              Limited OutSystems Vouchers Available!
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Save big on your certification and preparation costs today
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Voucher 1 */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-3xs">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <h5 className="font-sans font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  100% Discount Voucher
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                  Free OutSystems Platform
                </p>
              </div>
            </div>

            {/* Voucher 2 */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-3xs">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <h5 className="font-sans font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  50% Discount Voucher
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                  Get half-price access
                </p>
              </div>
            </div>
          </div>

          {/* Yellow Important/Promo Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-center">
            <p className="text-[11px] font-semibold text-slate-800 leading-relaxed">
              Before using PayPal, please contact me:
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-white border border-slate-200/60 py-1.5 rounded-lg shadow-3xs">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <a href="mailto:duongrbt@gmail.com" className="hover:underline">
                duongrbt@gmail.com
              </a>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug font-medium">
              I have special voucher offers that may save you money!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex shrink-0 justify-end">
          <button 
            onClick={onClose}
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
