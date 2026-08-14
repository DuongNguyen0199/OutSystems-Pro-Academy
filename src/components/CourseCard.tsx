import React, { useState } from 'react';
import { Course } from '../types';
import { Lock, Eye, EyeOff, Key, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MockExam from './MockExam';

interface CourseCardProps {
  key?: string;
  course: Course;
  onSelectPayment: (course: Course) => void;
  onSelectActivationCode: (course: Course) => void;
  onSelectVouchers: () => void;
}

export default function CourseCard({
  course,
  onSelectPayment,
  onSelectActivationCode,
  onSelectVouchers,
}: CourseCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Safe fallback to prevent blank/white screen if mockExam is undefined
  const safeMockExam = course.mockExam || [];

  // Strictly select the FIRST 10 text-only questions (questions WITHOUT images) in fixed original order
  const textOnlyQuestions = safeMockExam.filter(q => !q.imageUrl || q.imageUrl.trim() === '');
  const previewQuestions = (textOnlyQuestions.length >= 10 ? textOnlyQuestions : safeMockExam).slice(0, 10);

  const getTagStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border border-blue-150';
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-150';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border border-orange-150';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border border-purple-150';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Upper Content Frame */}
      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6">
        
        {/* Thumbnail Cover Photo */}
        <div className="w-full md:w-48 h-48 md:h-36 shrink-0 bg-slate-50 rounded-xl overflow-hidden relative border border-slate-200">
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'; }}
          />
          <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md md:hidden">
            ${course.price}
          </div>
        </div>

        {/* Text Metadata */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display font-bold text-lg md:text-xl text-slate-900 leading-snug">
                {course.title}
              </h3>
              <span className="font-display font-bold text-2xl text-slate-950 shrink-0 hidden md:inline-block">
                ${course.price}
              </span>
            </div>

            {/* Badges / Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {course.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${getTagStyle(tag.color)}`}
                >
                  {tag.text}
                </span>
              ))}
              {course.examSets && course.examSets.length > 0 && (
                <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  {course.examSets.length} Dumps
                </span>
              )}
            </div>

            <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed font-medium">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons Deck */}
      <div className="px-5 md:px-6 pb-5 md:pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100">
        
        {/* Question Preview Toggle */}
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className={`flex items-center justify-center gap-2 font-semibold text-xs md:text-sm py-2.5 px-4 rounded-xl border transition-all cursor-pointer ${
            isPreviewOpen 
              ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-3xs' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          {isPreviewOpen ? (
            <>
              <EyeOff className="w-4 h-4 text-slate-500" /> Hide Question Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-blue-600" /> Question Preview
            </>
          )}
        </button>

        {/* Practice Test Trigger */}
        <button
          onClick={() => onSelectActivationCode(course)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Key className="w-4 h-4 text-amber-300" /> Practice Test
        </button>

        {/* Payment QR / Request Access */}
        <button
          onClick={() => onSelectPayment(course)}
          className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
        >
          <Lock className="w-4 h-4 text-slate-500" /> Buy Course / Payment Info
        </button>
      </div>

      {/* Collapsible Content Area */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50/30"
          >
            <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
              
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Question Preview Mode (Free 10-Question Demo)
                </span>
                <span className="text-[11px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md">
                  {previewQuestions.length} / {safeMockExam.length} Questions
                </span>
              </div>

              {/* Quick Demo Quiz Component */}
              <MockExam 
                courseTitle={course.title}
                questions={previewQuestions}
                totalAvailableQuestions={safeMockExam.length}
                onOpenActivation={() => onSelectActivationCode(course)}
                onOpenPayment={() => onSelectPayment(course)}
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
