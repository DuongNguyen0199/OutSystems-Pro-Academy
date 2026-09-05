import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CourseCard from './components/CourseCard';
import CourseCardSkeleton from './components/CourseCardSkeleton';
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

  // Synchronized Theme State (Item 2)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('outsystems_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('outsystems_theme', nextTheme);
  };

  // Modals state
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [selectedCourseForCode, setSelectedCourseForCode] = useState<Course | null>(null);
  const [activeUdemyExamCourse, setActiveUdemyExamCourse] = useState<Course | null>(null);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load user session and dynamic courses on mount
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

  // Dynamic stats calculation from actual database courses list
  const totalCoursesCount = coursesList.length;
  const totalQuestionsCount = coursesList.reduce((sum, course) => {
    let qCount = 0;
    if (course.examSets && Array.isArray(course.examSets) && course.examSets.length > 0) {
      qCount = course.examSets.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0);
    }
    if (qCount === 0 && course.mockExam && Array.isArray(course.mockExam)) {
      qCount = course.mockExam.length;
    }
    return sum + qCount;
  }, 0);

  // Filter and sort courses alphabetically (A -> Z)
  const filteredCourses = [...coursesList]
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    .filter((course) => {
      const query = searchQuery.toLowerCase();
      const matchesTitle = course.title.toLowerCase().includes(query);
      const matchesDescription = course.description.toLowerCase().includes(query);
      const matchesTags = course.tags.some((tag) => tag.text.toLowerCase().includes(query));
      return matchesTitle || matchesDescription || matchesTags;
    });

  if (isAdminOpen) {
    return (
      <AdminDashboard
        courses={coursesList}
        onClose={() => setIsAdminOpen(false)}
        onUpdateCourses={(updated) => setCoursesList(updated)}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-850'
    }`}>
      
      {/* Navbar Header */}
      <Header 
        dbSource={dbSource} 
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
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
                  <Youtube className="w-4 h-4 fill-white text-white shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Sub YouTube @outsystems-pro-academy</span>
                </a>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
                Ace Your OutSystems Certifications with Official 100% Exam Dumps
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                Comprehensive question banks, timed practice exams, and step-by-step explanations for O11 and ODC Certifications.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0 font-sans">
              <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 p-3.5 rounded-2xl text-center space-y-1">
                <span className="font-display font-extrabold text-xl text-blue-400">{totalCoursesCount}</span>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Cert Courses</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 p-3.5 rounded-2xl text-center space-y-1">
                <span className="font-display font-extrabold text-xl text-emerald-400">
                  {totalQuestionsCount > 0 ? `${totalQuestionsCount.toLocaleString()}+` : '1,800+'}
                </span>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Exam Questions</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 p-3.5 rounded-2xl text-center space-y-1">
                <span className="font-display font-extrabold text-xl text-amber-400">24/7</span>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Access & Support</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 p-3.5 rounded-2xl text-center space-y-1">
                <span className="font-display font-extrabold text-xl text-purple-400">O11 & ODC</span>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Platforms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search courses by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-2xl py-3 pl-10 pr-4 text-xs md:text-sm outline-none transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Showing {filteredCourses.length} Courses</span>
          </div>
        </div>

        {/* Course Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <CourseCardSkeleton key={n} theme={theme} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectPayment={(c) => setSelectedCourseForPayment(c)}
                onSelectActivationCode={(c) => setSelectedCourseForCode(c)}
                onSelectVouchers={() => setIsVouchersOpen(true)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-8 px-4 text-center text-xs transition-colors ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-500'
      }`}>
        <p>© 2026 OutSystems Pro Academy — Official Certification Dumps & Practice Exams</p>
      </footer>

      {/* Modals */}
      {selectedCourseForPayment && (
        <PaymentModal
          course={selectedCourseForPayment}
          onClose={() => setSelectedCourseForPayment(null)}
        />
      )}

      {selectedCourseForCode && (
        <ActivationCodeModal
          course={selectedCourseForCode}
          user={user}
          onClose={() => setSelectedCourseForCode(null)}
          onSuccessUnlock={(unlockedCourse) => {
            setSelectedCourseForCode(null);
            setActiveUdemyExamCourse(unlockedCourse);
          }}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />
      )}

      {activeUdemyExamCourse && (
        <UdemyMockExam
          course={activeUdemyExamCourse}
          onClose={() => setActiveUdemyExamCourse(null)}
        />
      )}

      {isVouchersOpen && (
        <VouchersModal onClose={() => setIsVouchersOpen(false)} />
      )}

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}
    </div>
  );
}
