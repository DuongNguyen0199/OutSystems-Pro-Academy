import React, { useState } from 'react';
import { Course } from '../types';
import { Lock, Gift, ChevronDown, ChevronUp, Eye, EyeOff, ClipboardList, BookOpen, Key } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'free-questions' | 'interactive-exam'>('free-questions');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    [course.previewQuestions[0]?.id || '']: true
  });

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
            </div>

            <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed font-medium">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons Deck */}
      <div className="px-5 md:px-6 pb-5 md:pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100">
        
        {/* Live Preview Toggle */}
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
              <EyeOff className="w-4 h-4 text-slate-500" /> Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-blue-600" /> Free Preview (10 Questions)
            </>
          )}
        </button>

        {/* Enter Code / Start Full Test Trigger */}
        <button
          onClick={() => onSelectActivationCode(course)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Key className="w-4 h-4 text-amber-300" /> Enter Activation Code
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
            <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-100">
              
              {/* Toggle Selection Tabs */}
              <div className="flex border-b border-slate-200 mb-5 max-w-sm">
                <button
                  onClick={() => setActiveTab('free-questions')}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'free-questions'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Free Sample Questions
                </button>
                <button
                  onClick={() => setActiveTab('interactive-exam')}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'interactive-exam'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Quick Demo Quiz
                </button>
              </div>

              {activeTab === 'free-questions' ? (
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-500 mb-4 tracking-wide uppercase">
                    Free Sample Questions ({course.previewQuestions.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {course.previewQuestions.map((q) => {
                      const isExpanded = expandedQuestions[q.id];
                      return (
                        <div 
                          key={q.id}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                        >
                          <button
                            onClick={() => toggleQuestion(q.id)}
                            className="w-full text-left p-4 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          >
                            <span className="font-display font-semibold text-sm text-slate-900 leading-snug">
                              {q.question}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border-t border-slate-100"
                              >
                                <div className="p-4 bg-slate-50/70 text-slate-700 text-xs md:text-sm leading-relaxed space-y-2">
                                  <div className="font-bold text-slate-500 text-[10px] tracking-wider uppercase">
                                    Explanation & Answer:
                                  </div>
                                  <p className="font-sans font-medium text-slate-850">{q.answer}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <MockExam 
                  courseTitle={course.title}
                  questions={course.mockExam} 
                />
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
