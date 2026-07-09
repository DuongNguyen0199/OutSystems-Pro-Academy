import React from 'react';
import { X, Check } from 'lucide-react';
import { Course } from '../types';

interface PaymentModalProps {
  course: Course;
  onClose: () => void;
}

export default function PaymentModal({ course, onClose }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      {/* Outer wrapper backdrop clicking closes the modal */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />
      
      {/* Modal Container with max height & flex scroll */}
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 leading-tight">
              Course Payment
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-[280px] sm:max-w-xs">
              {course.title}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* PayPal QR Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs max-w-[240px] mx-auto text-center flex flex-col items-center">
            <h4 className="font-display font-bold text-base text-slate-900 mb-2">
              Dương Nguyễn
            </h4>
            
            {/* Elegant PayPal QR Code Image Container */}
            <div className="relative p-2 bg-white rounded-lg border border-slate-150 shadow-3xs flex items-center justify-center overflow-hidden">
              <img 
                src="https://nzwmqifbxbptjgdiwvsd.supabase.co/storage/v1/object/sign/OutSystems%20Practice%20Tests/mypaypal.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNmQwMjM5OS04YjBlLTQxNTctOTBiMS1kOGYzOTIwZjdjZWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPdXRTeXN0ZW1zIFByYWN0aWNlIFRlc3RzL215cGF5cGFsLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MzY5MjMsImV4cCI6NDkzNzAzNjkyM30.AyRxzIM01IZDeUvLOQprbSOz_a6nWHM6MntNoEX0czY" 
                alt="PayPal QR Code for Dương Nguyễn"
                className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 bg-[#0079C1] rounded-full animate-pulse"></span>
              PayPal QR Code
            </div>
          </div>

          {/* Payment Instructions (Optimized & merged to remove redundancy) */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2.5">
            <h5 className="font-display font-semibold text-xs text-slate-900 uppercase tracking-wider">
              How to access the course:
            </h5>
            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed font-medium">
              <li>
                Scan the QR code to pay <strong className="text-slate-900 font-bold">${course.price}</strong>.
              </li>
              <li>
                Send confirmation email to <a href="mailto:duongrbt@gmail.com" className="underline font-bold text-blue-600 hover:text-blue-700">duongrbt@gmail.com</a>.
              </li>
              <li>
                We will verify and send your login/access link instantly!
              </li>
            </ol>
          </div>

          {/* Quick Notice */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
              Instant activation support: <strong className="text-emerald-950">duongrbt@gmail.com</strong>.
            </p>
          </div>

        </div>

        {/* Footer (Sticky at the bottom for easy closing) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex shrink-0 justify-end">
          <button 
            onClick={onClose}
            className="w-full text-center border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 font-semibold py-2 rounded-xl transition-all cursor-pointer text-xs sm:text-sm shadow-3xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
