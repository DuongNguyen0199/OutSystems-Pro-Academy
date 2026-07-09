import React from 'react';
import { Gift, Award, Youtube } from 'lucide-react';

interface HeaderProps {
  dbSource?: string;
  onOpenVouchers?: () => void;
}

export default function Header({ dbSource = 'local', onOpenVouchers }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-100 py-3.5 px-4 md:px-12 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* OutSystems style concentric logo */}
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div className="absolute w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-xs">
              <div className="w-5.5 h-5.5 border-3 border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              </div>
            </div>
            {/* Small red tail node representing the classic OutSystems target element */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight flex items-center justify-center sm:justify-start gap-1.5">
              OutSystems Pro Academy
              <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                <Award className="w-3 h-3 text-blue-500" />
                Specialist
              </span>
            </h1>
            <p className="font-sans text-[11px] text-slate-500 font-medium">
              OutSystems Practice Tests & Exam Preparation
            </p>
          </div>
        </div>
        
        {/* Interactive Promo / Vouchers trigger and Highly Prominent YouTube badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <a
            href="https://www.youtube.com/@outsystems-pro-academy"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Youtube className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
            <span>YouTube Channel</span>
          </a>

          {onOpenVouchers && (
            <button
              onClick={onOpenVouchers}
              className="group flex items-center gap-1.5 bg-linear-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Gift className="w-3.5 h-3.5 animate-bounce group-hover:scale-110 transition-transform" />
              <span>Get 100% Discount Vouchers</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-200"></span>
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


