import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CourseCard from './components/CourseCard';
import PaymentModal from './components/PaymentModal';
import VouchersModal from './components/VouchersModal';
import AuthModal from './components/AuthModal';
import ActivationCodeModal from './components/ActivationCodeModal';
import UdemyMockExam from './components/UdemyMockExam';
import AdminDashboard from './components/AdminDashboard';
import { fallbackCourses } from './data_fallback';
import { Course, UserProfile } from './types';
import { Search, Mail, AlertCircle, Sparkles, Copy, Check, Youtube } from 'lucide-react';

export default function App() {
  const [coursesList, setCoursesList] = useState<Course[]>(fallbackCourses);
  const [dbSource, setDbSource] = useState<string>('local');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modals state
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [selectedCourseForCode, setSelectedCourseForCode] = useState<Course | null>(null);
  const [activeUdemyExamCourse, setActiveUdemyExamCourse] = useState<Course | null>(null);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('outsystems_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    fetch('/api/courses')
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {
          setCoursesList(data.data);
        }
        if (data && data.source) {
          setDbSource(data.source);
        }
      })
      .catch((err) => {
        console.error("Error loading courses via API, using fallback data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('outsystems_user');
    setUser(null);
  };

  // Filter courses based on search
  const filteredCourses = coursesList.filter((course) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = course.title.toLowerCase().includes(query);
    const matchesDescription = course.description.toLowerCase().includes(query);
    const matchesTags = course.tags.some((tag) => tag.text.toLowerCase().includes(query));
    return matchesTitle || matchesDescription || matchesTags;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar Header */}
      <Header 
        dbSource={dbSource} 
        user={user}
        onOpenVouchers={() => setIsVouchersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-8">
        
        {/* Premium Redesigned Hero Banner */}
        <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 md:p-10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
            <div className="space-y-3.5 max-w-2xl text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
                  <span>OutSystems Exam Dump & Practice Test Portal</span>
                </div>
                <a
                  href="https://www.youtube.com/@outsystems-pro-academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:to-rose-700 hover:to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Youtube className="w-4 h-4 fill-white text-white animate-pulse shrink-0" />
                  <span>OutSystems Pro Academy YouTube</span>
                </a>
              </div>

              <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
                Pass Your Certification <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">On The First Try</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                100% verified OutSystems dumps & practice tests with Udemy-style exam simulator, step-by-step answers, and Gemini AI Tutor.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 pt-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-850/50 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Up-To-Date Material</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-850/50 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Udemy Test Simulator</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-850/50 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Discount Vouchers Available</span>
                </div>
              </div>
            </div>
            
            {/* Call to action contact box */}
            <div className="w-full lg:w-auto shrink-0 flex justify-center">
              <div className="bg-slate-950/60 backdrop-blur-xs border border-slate-800/80 p-5 rounded-2xl space-y-4 w-full max-w-xs md:w-80 shadow-2xl">
                <div className="space-y-1 text-center lg:text-left">
                  <p className="text-blue-400 text-[10px] font-bold tracking-wider uppercase">
                    GET EXAM DUMP & SUPPORT
                  </p>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    Contact the instructor directly via email to access special prep bundles & vouchers:
                  </p>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                      <a 
                        href="mailto:duongrbt@gmail.com" 
                        className="text-xs font-bold text-slate-200 hover:text-white truncate hover:underline font-mono"
                      >
                        duongrbt@gmail.com
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('duongrbt@gmail.com');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  
                  <a
                    href="mailto:duongrbt@gmail.com"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Admin Directly</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Input Panel */}
        <div className="max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by name or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Course Cards Container */}
        <div className="space-y-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectPayment={(c) => setSelectedCourseForPayment(c)}
                onSelectActivationCode={(c) => setSelectedCourseForCode(c)}
                onSelectVouchers={() => setIsVouchersOpen(true)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-display font-semibold text-lg text-slate-900">
                No courses found
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-blue-600 underline cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-8 px-6 md:px-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 OutSystems Practice Tests & Exam Preparation. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="mailto:duongrbt@gmail.com" className="hover:text-slate-600 underline">
              Contact Instructor (duongrbt@gmail.com)
            </a>
          </div>
        </div>
      </footer>

      {/* DYNAMIC MODALS */}

      {/* 1. Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}

      {/* 2. Payment Modal */}
      {selectedCourseForPayment && (
        <PaymentModal
          course={selectedCourseForPayment}
          user={user}
          onClose={() => setSelectedCourseForPayment(null)}
        />
      )}

      {/* 3. Activation Code Modal */}
      {selectedCourseForCode && (
        <ActivationCodeModal
          course={selectedCourseForCode}
          user={user}
          onClose={() => setSelectedCourseForCode(null)}
          onSuccess={(c) => setActiveUdemyExamCourse(c)}
          onRequestPayment={() => {
            const courseToPay = selectedCourseForCode;
            setSelectedCourseForCode(null);
            setSelectedCourseForPayment(courseToPay);
          }}
        />
      )}

      {/* 4. Udemy-Style Practice Exam Simulator */}
      {activeUdemyExamCourse && (
        <UdemyMockExam
          course={activeUdemyExamCourse}
          onClose={() => setActiveUdemyExamCourse(null)}
        />
      )}

      {/* 5. Vouchers Modal */}
      {isVouchersOpen && (
        <VouchersModal
          onClose={() => setIsVouchersOpen(false)}
        />
      )}

      {/* 6. Admin Management Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          courses={coursesList}
          onClose={() => setIsAdminOpen(false)}
          onUpdateCourses={(updated) => setCoursesList(updated)}
        />
      )}

    </div>
  );
}
