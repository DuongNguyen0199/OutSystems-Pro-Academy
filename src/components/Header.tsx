import React from 'react';
import { Gift, Award, Youtube, User, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  dbSource?: string;
  user: UserProfile | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenVouchers?: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export default function Header({
  dbSource = 'local',
  user,
  theme = 'light',
  onToggleTheme,
  onOpenVouchers,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
}: HeaderProps) {
  return (
    <header className={`w-full py-3.5 px-4 md:px-12 sticky top-0 z-40 shadow-xs border-b transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-100 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div className="absolute w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-xs">
              <div className="w-5.5 h-5.5 border-3 border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className={`font-display font-extrabold text-base sm:text-lg tracking-tight leading-tight flex items-center justify-center sm:justify-start gap-1.5 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              OutSystems Pro Academy
              <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                <Award className="w-3 h-3 text-blue-500" />
                Specialist Dumps
              </span>
            </h1>
            <p className={`font-sans text-[11px] font-medium ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              OutSystems Practice Tests & Certification Exam Dumps
            </p>
          </div>
        </div>
        
        {/* Right Nav Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle Button (Item 2) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          <a
            href="https://www.youtube.com/@outsystems-pro-academy"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
            <span className="hidden sm:inline">YouTube</span>
          </a>

          {onOpenVouchers && (
            <button
              onClick={onOpenVouchers}
              className="group flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 animate-bounce" />
              <span>Vouchers</span>
            </button>
          )}

          {/* User Auth Status & Admin-Only Button */}
          {user ? (
            <div className={`flex items-center gap-2 p-1 rounded-full border ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <span className={`text-xs font-bold px-2.5 truncate max-w-[120px] sm:max-w-xs flex items-center gap-1 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <User className="w-3.5 h-3.5 text-blue-500" />
                {user.email}
              </span>

              {/* ONLY SHOW ADMIN PANEL IF LOGGED IN AS ADMIN ROLE */}
              {user.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-600 p-1 rounded-full transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
