import React, { useState, useEffect } from 'react';
import { Course, MockExamQuestion, ExamSet } from '../types';
import {
  Clock,
  Flag,
  CheckCircle,
  XCircle,
  Sparkles,
  HelpCircle,
  Award,
  AlertCircle,
  X,
  FileText,
  Check,
  Settings,
  Grid,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface UdemyMockExamProps {
  course: Course;
  onClose: () => void;
}

export default function UdemyMockExam({ course, onClose }: UdemyMockExamProps) {
  const defaultSets: ExamSet[] = (course.examSets && course.examSets.length > 0)
    ? course.examSets
    : [
        {
          id: 'set-1',
          title: 'Dump 01',
          description: 'Bài kiểm tra thực hành Dump 01',
          durationMinutes: 90,
          passingScorePct: 70,
          randomizeQuestions: false,
          questions: course.mockExam || []
        }
      ];

  // Helper: Fisher-Yates Shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper: Shuffle question choices while updating correct answer key
  const shuffleQuestionChoices = (q: MockExamQuestion): MockExamQuestion => {
    if (!q.choices || q.choices.length < 2) return q;
    const correctChoiceObj = q.choices.find((c) => c.key === q.correctAnswer);
    const shuffledChoicesRaw = shuffleArray(q.choices);
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    let newCorrectKey = 'A';

    const newChoices = shuffledChoicesRaw.map((choice, idx) => {
      const newKey = keys[idx] || choice.key;
      if (correctChoiceObj && choice.key === correctChoiceObj.key) {
        newCorrectKey = newKey;
      }
      return {
        key: newKey,
        text: choice.text
      };
    });

    return {
      ...q,
      choices: newChoices,
      correctAnswer: newCorrectKey
    };
  };

  // 1. Randomly pick an exam set (Dump 01 - 06)
  const getRandomSet = () => {
    const randomIndex = Math.floor(Math.random() * defaultSets.length);
    return defaultSets[randomIndex];
  };

  // 2. Prepare shuffled questions
  const getShuffledQuestions = (set: ExamSet) => {
    const rawQuestions = set.questions && set.questions.length > 0
      ? set.questions
      : (course.mockExam || []);
    const shuffledQs = shuffleArray(rawQuestions);
    return shuffledQs.map(shuffleQuestionChoices);
  };

  // State initialization for randomly assigned set and randomized questions
  const [selectedSet, setSelectedSet] = useState<ExamSet>(() => getRandomSet());
  const [questions, setQuestions] = useState<MockExamQuestion[]>(() => getShuffledQuestions(selectedSet));

  // Directly start in 'confirm_details' phase (Prometric Schedule Exam screen)
  const [examPhase, setExamPhase] = useState<'confirm_details' | 'intro' | 'exam' | 'result'>('confirm_details');

  const durationSecs = (selectedSet.durationMinutes || 90) * 60;
  const passingPctThreshold = selectedSet.passingScorePct || 70;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(durationSecs);
  const [introTimeLeft, setIntroTimeLeft] = useState<number>(15 * 60); // 15 mins for intro
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState<boolean>(false);
  const [showQuestionGridModal, setShowQuestionGridModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // User candidate info
  const savedUserStr = localStorage.getItem('outsystems_user');
  let candidateEmail = 'CFAlanren';
  if (savedUserStr) {
    try {
      const u = JSON.parse(savedUserStr);
      if (u.email) candidateEmail = u.email;
    } catch (e) {}
  }

  // Update timer when set changes
  useEffect(() => {
    setTimeLeft((selectedSet.durationMinutes || 90) * 60);
  }, [selectedSet]);

  // AI Tutor explanations
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<number, boolean>>({});

  // Main countdown timer for live exam
  useEffect(() => {
    if (examPhase !== 'exam' || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTestSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examPhase, isSubmitted]);

  // Intro countdown timer
  useEffect(() => {
    if (examPhase !== 'intro') return;
    const introTimer = setInterval(() => {
      setIntroTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(introTimer);
  }, [examPhase]);

  const currentQ = questions[currentIndex];

  const handleSelectChoice = (choiceKey: string) => {
    if (isSubmitted || examPhase !== 'exam') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: choiceKey
    }));
  };

  const toggleFlag = (index: number) => {
    if (isSubmitted || examPhase !== 'exam') return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFinishTestSubmit = () => {
    setIsSubmitted(true);
    setExamPhase('result');
    setShowConfirmFinishModal(false);
  };

  const handleRetakeRandomExam = () => {
    const nextSet = getRandomSet();
    const nextQuestions = getShuffledQuestions(nextSet);
    setSelectedSet(nextSet);
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeLeft((nextSet.durationMinutes || 90) * 60);
    setIsSubmitted(false);
    setExamPhase('confirm_details');
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    const scorePct = Math.round((correctCount / (questions.length || 1)) * 100);
    const passed = scorePct >= passingPctThreshold;
    return { correctCount, total: questions.length, scorePct, passed };
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFetchAiExplanation = async (qIndex: number, questionObj: MockExamQuestion) => {
    if (aiExplanations[qIndex] || loadingAi[qIndex]) return;
    setLoadingAi((prev) => ({ ...prev, [qIndex]: true }));

    try {
      const promptText = `Provide a concise 2-sentence explanation why option ${questionObj.correctAnswer} is correct for: "${questionObj.question}"`;
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const data = await res.json();
      setAiExplanations((prev) => ({
        ...prev,
        [qIndex]: data.explanation || questionObj.explanation
      }));
    } catch (e) {
      setAiExplanations((prev) => ({
        ...prev,
        [qIndex]: questionObj.explanation
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [qIndex]: false }));
    }
  };

  // --------------------------------------------------------------------------
  // PHASE 0: SELECT PRACTICE TEST SET SCREEN (Dump 01 - Dump 06)
  // --------------------------------------------------------------------------
  if (examPhase === 'select_set') {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#444444] text-white p-6 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#76b82a] uppercase tracking-widest block mb-1">
                SELECT PRACTICE TEST SET
              </span>
              <h2 className="font-display font-extrabold text-xl text-white">
                {course.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-slate-600 font-medium">
              Khóa học này có <strong>{defaultSets.length} bộ đề thi thực hành</strong>. Vui lòng chọn bộ đề bạn muốn thực hành:
            </p>

            <div className="space-y-3">
              {defaultSets.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => {
                    setSelectedSet(s);
                    setExamPhase('confirm_details');
                  }}
                  className="bg-slate-50 hover:bg-lime-50 border-2 border-slate-200 hover:border-[#76b82a] p-4 rounded-xl flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center font-mono group-hover:bg-[#76b82a] transition-colors">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#68a424]">
                        Bài kiểm tra thực hành {idx + 1}: {s.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {s.description || `Bộ đề thi mô phỏng ${s.title}`}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                        <span>{s.questions?.length || 0} câu hỏi</span>
                        <span>•</span>
                        <span>{s.durationMinutes || 90} phút</span>
                        <span>•</span>
                        <span>Đạt {s.passingScorePct || 70}%</span>
                      </div>
                    </div>
                  </div>

                  <button className="bg-[#76b82a] group-hover:bg-[#68a424] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer">
                    <span>Vào Thi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((Object.keys(selectedAnswers).length / questions.length) * 100);

  // --------------------------------------------------------------------------
  // PHASE 1: CONFIRM DETAILS SCREEN (Prometric Screenshot 3)
  // --------------------------------------------------------------------------
  if (examPhase === 'confirm_details') {
    return (
      <div className="fixed inset-0 bg-[#c5d1d6] z-50 flex items-center justify-center p-4 font-sans select-none">
        <div className="bg-white rounded w-full max-w-xl shadow-2xl overflow-hidden border-2 border-slate-400">
          {/* Header */}
          <div className="bg-[#444444] text-white px-5 py-3 flex items-center justify-between font-mono text-sm border-b border-slate-600">
            <span className="font-bold">Confirm Details</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
              <Clock className="w-4 h-4" /> 00:02:00
            </span>
          </div>

          <div className="p-8 space-y-6">
            {/* Prometric Header Logos */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-600 text-white rounded flex items-center justify-center font-extrabold text-sm shadow">
                  OS
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-sm">OutSystems Pro Academy</h4>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Official Dumps Center</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-[#76b82a] tracking-widest text-lg block">PROMETRIC</span>
                <p className="text-[10px] text-slate-400 font-mono">TESTING CENTER SIMULATION</p>
              </div>
            </div>

            {/* Candidate Box */}
            <div className="bg-slate-50 border border-slate-300 rounded p-6 space-y-3 font-mono text-xs text-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Candidate Email:</span>
                <span className="col-span-2 font-bold text-slate-900">{candidateEmail}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Test Name:</span>
                <span className="col-span-2 font-bold text-blue-900">{course.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Questions:</span>
                <span className="col-span-2 font-bold text-slate-900">{questions.length} Items</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Time Allowed:</span>
                <span className="col-span-2 font-bold text-slate-900">{Math.round((questions.length * 90) / 60)} Minutes</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Exam Set Assigned:</span>
                <span className="col-span-2 font-bold text-purple-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {selectedSet.title} (Randomly Assigned & Shuffled)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Language:</span>
                <span className="col-span-2 font-bold text-slate-900">English</span>
              </div>
            </div>

            {/* Are details correct prompt */}
            <div className="text-center space-y-4 pt-2">
              <p className="font-bold text-slate-800 text-sm">Are the details above correct?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setExamPhase('intro')}
                  className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-8 py-2.5 rounded shadow transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Check className="w-4 h-4" /> Confirm
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-8 py-2.5 rounded shadow transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PHASE 2: INTRODUCTION & EXAM STRUCTURE SCREEN (Prometric Screenshot 1)
  // --------------------------------------------------------------------------
  if (examPhase === 'intro') {
    return (
      <div className="fixed inset-0 bg-[#c5d1d6] z-50 flex items-center justify-center p-3 font-sans select-none">
        <div className="w-full max-w-[1280px] h-[95vh] bg-white border-2 border-slate-400 rounded shadow-2xl flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="bg-[#444444] text-white px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-700 shadow">
            <div>
              <span className="font-bold">Page: 1</span>
              <span className="mx-2 text-slate-400">|</span>
              <span>Section: Introduction</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Introduction Time Remaining: {formatTime(introTimeLeft)}</span>
              </div>
              <div className="bg-slate-600 rounded-full h-2.5 w-32 overflow-hidden border border-slate-500">
                <div className="bg-[#76b82a] h-full w-[10%]" />
              </div>
              <span className="text-[11px] text-slate-300">Progress 0%</span>
            </div>

            <button
              onClick={() => setExamPhase('exam')}
              className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-5 py-1.5 rounded shadow text-xs cursor-pointer"
            >
              Finish Test
            </button>
          </header>

          {/* Sub Header Green Bar */}
          <div className="bg-[#76b82a] text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm">
            <span>Test: {course.title} Exam Simulation</span>
            <span>Candidate: {candidateEmail}</span>
          </div>

          {/* Main Content Body */}
          <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-[#ffffff]">
            {/* Left Vertical Section Tabs */}
            <div className="w-16 flex flex-col gap-1 overflow-y-auto pr-1">
              {Array.from({ length: Math.min(24, questions.length) }).map((_, i) => (
                <div
                  key={i}
                  className={`py-1.5 px-1 text-center font-extrabold text-xs text-white rounded-l flex items-center justify-center ${
                    i === 0 ? 'bg-[#444444] shadow' : 'bg-[#76b82a] hover:bg-[#68a424]'
                  }`}
                >
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Center Main Introduction White Container */}
            <div className="flex-1 bg-white border border-slate-300 rounded p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed shadow-xs">
              <h2 className="font-display font-extrabold text-lg text-slate-900 border-b pb-3">
                {course.title} — Exam Simulation
              </h2>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Exam Structure</h3>
                <p>
                  This official OutSystems certification simulation exam contains <strong>{questions.length} multiple-choice questions</strong>. You will have <strong>{Math.round((questions.length * 90) / 60)} minutes</strong> to complete the exam.
                </p>
              </div>

              <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded">
                <h3 className="font-bold text-slate-900 text-sm">Exam Instructions & Passing Criteria</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                  <li>You must answer at least <strong>70% of the questions correctly</strong> to earn your certification badge.</li>
                  <li>Read each question carefully and select choices <strong>A, B, C, or D</strong>.</li>
                  <li>You can flag any questions for review using the <strong>Flag Question</strong> button at the bottom right.</li>
                  <li>Use the left navigation bar or the <strong>Next / Previous</strong> buttons to navigate between questions.</li>
                  <li>Click <strong>Finish Test</strong> at the top right or bottom right when you are ready to submit your answers.</li>
                </ul>
              </div>

              <p className="text-slate-500 italic pt-4">
                Note: This simulation environment reproduces the exact Prometric Testing Center interface used for official OutSystems certification exams worldwide.
              </p>
            </div>
          </div>

          {/* Bottom Navigation Footer Bar */}
          <footer className="bg-[#444444] text-white px-4 py-2.5 flex items-center justify-between border-t border-slate-600 text-xs">
            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer" title="Question Matrix Grid">
                <Grid className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer" title="Help Instructions">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setExamPhase('confirm_details')}
                className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-4 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"
              >
                &lt; Back
              </button>
              <button
                onClick={() => setExamPhase('exam')}
                className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-4 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"
              >
                Next &gt;
              </button>
              <button
                onClick={() => setExamPhase('exam')}
                className="bg-[#76b82a] hover:bg-[#68a424] text-white font-extrabold px-6 py-1.5 rounded shadow text-xs cursor-pointer flex items-center gap-1"
              >
                Start the Test &gt;
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PHASE 3: LIVE PROMETRIC QUESTION EXAM SCREEN (Prometric Screenshot 1 & 2)
  // --------------------------------------------------------------------------
  if (examPhase === 'exam' && !isSubmitted) {
    const answeredCount = Object.keys(selectedAnswers).length;
    const isCurrentFlagged = flaggedQuestions[currentIndex];

    return (
      <div className="fixed inset-0 bg-[#c5d1d6] z-50 flex items-center justify-center p-3 font-sans select-none">
        <div className="w-full max-w-[1280px] h-[95vh] bg-white border-2 border-slate-400 rounded shadow-2xl flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="bg-[#444444] text-white px-4 py-2 flex items-center justify-between text-xs font-mono border-b border-slate-700 shadow">
            <div className="leading-tight">
              <div className="font-bold">Question:{currentIndex + 1}</div>
              <div>Section:1</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-xs text-white">
                  Section Time Remaining {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-600 rounded-full h-2.5 w-28 overflow-hidden border border-slate-500">
                  <div
                    className="bg-[#76b82a] h-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-200">Progress {progressPercentage}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmFinishModal(true)}
              className="bg-[#76b82a] hover:bg-[#68a424] text-white font-extrabold px-5 py-1.5 rounded shadow text-xs cursor-pointer transition-all hover:scale-105"
            >
              Finish Test
            </button>
          </header>

          {/* Sub Header Green Bar */}
          <div className="bg-[#76b82a] text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm">
            <span>Test: {course.title}</span>
            <span>Candidate: {candidateEmail}</span>
          </div>

          {/* Main Workspace: Left Vertical Navigator + Center Question Display */}
          <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-[#ffffff]">
            {/* Left Navigation Sidebar (Vertical Question Stack) */}
            <div className="w-16 flex flex-col gap-1 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isFlagged = flaggedQuestions[idx];

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full py-1.5 px-1 rounded-l text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#444444] text-white shadow-md font-black'
                        : isFlagged
                        ? 'bg-[#444444] text-amber-300'
                        : 'bg-[#76b82a] text-white hover:bg-[#68a424]'
                    }`}
                  >
                    <div className="flex items-center gap-1 w-full justify-between px-1">
                      <span>{idx + 1}</span>
                      {isFlagged ? (
                        <Flag className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                      ) : isAnswered ? (
                        <FileText className="w-3 h-3 text-emerald-200 shrink-0" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center Main Question Display Window */}
            <div className="flex-1 bg-white border border-slate-300 rounded p-6 overflow-y-auto flex flex-col justify-between shadow-xs">
              <div className="space-y-6">
                {/* Question Text Box (Prometric Light Gray Box) */}
                <div className="bg-[#f5f5f5] border border-slate-200 rounded p-5 text-slate-900 font-medium text-sm leading-relaxed shadow-xs">
                  <p className="text-slate-900 font-semibold leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Question Illustration Image (if present) */}
                {currentQ.imageUrl && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-center">
                    <img
                      src={currentQ.imageUrl}
                      alt="Question Diagram"
                      className="max-h-60 object-contain rounded border border-slate-300 shadow-sm"
                    />
                  </div>
                )}

                {/* Choices A, B, C, D Rectangular Boxes */}
                <div className="space-y-3 pt-2">
                  {currentQ.choices.map((choice) => {
                    const isChoiceSelected = selectedAnswers[currentIndex] === choice.key;
                    return (
                      <div
                        key={choice.key}
                        onClick={() => handleSelectChoice(choice.key)}
                        className={`border-2 rounded p-3.5 flex items-center gap-4 transition-all cursor-pointer select-none ${
                          isChoiceSelected
                            ? 'border-[#b87e00] bg-[#e5a417] text-slate-950 font-bold shadow-md'
                            : 'border-[#444444] bg-white hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded font-extrabold text-xs flex items-center justify-center font-mono shrink-0 ${
                            isChoiceSelected
                              ? 'bg-slate-900 text-amber-400'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {choice.key}
                        </div>
                        <span className="text-xs font-semibold flex-1 leading-snug">
                          {choice.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Footer Bar */}
          <footer className="bg-[#444444] text-white px-4 py-2.5 flex items-center justify-between border-t border-slate-600 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {}}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowQuestionGridModal(true)}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer"
                title="Question Matrix Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-200 cursor-pointer"
                title="Help Instructions"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFlag(currentIndex)}
                className={`p-2 rounded font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${
                  isCurrentFlagged
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-[#76b82a] hover:bg-[#68a424] text-white'
                }`}
                title="Flag Question"
              >
                <Flag className={`w-4 h-4 ${isCurrentFlagged ? 'fill-slate-950' : 'fill-white'}`} />
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center gap-1 ${
                  currentIndex === 0
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-[#76b82a] hover:bg-[#68a424] text-white'
                }`}
              >
                &lt; Back
              </button>

              <button
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else {
                    setShowConfirmFinishModal(true);
                  }
                }}
                className="bg-[#76b82a] hover:bg-[#68a424] text-white font-extrabold px-6 py-1.5 rounded shadow text-xs cursor-pointer flex items-center gap-1"
              >
                {currentIndex === questions.length - 1 ? 'Finish Test >' : 'Next >'}
              </button>
            </div>
          </footer>

          {/* CONFIRM FINISH MODAL */}
          {showConfirmFinishModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-300">
                <h3 className="font-display font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Finish Test Confirmation
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2 text-slate-700 font-mono">
                  <p className="flex justify-between">
                    <span>Total Questions:</span>
                    <strong className="text-slate-900">{questions.length}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Answered Questions:</span>
                    <strong className="text-emerald-700">{answeredCount}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Unanswered Questions:</span>
                    <strong className="text-rose-700">{questions.length - answeredCount}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Flagged Questions:</span>
                    <strong className="text-amber-700">{Object.values(flaggedQuestions).filter(Boolean).length}</strong>
                  </p>
                </div>

                <p className="text-xs text-slate-600">
                  Are you sure you want to finish and submit your exam answers?
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmFinishModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded text-xs cursor-pointer"
                  >
                    Return to Test
                  </button>
                  <button
                    onClick={handleFinishTestSubmit}
                    className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-5 py-2 rounded text-xs shadow cursor-pointer"
                  >
                    Submit & Finish Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION GRID MODAL */}
          {showQuestionGridModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4 shadow-2xl border border-slate-300">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                    <Grid className="w-5 h-5 text-[#76b82a]" />
                    Question Matrix Navigator
                  </h3>
                  <button onClick={() => setShowQuestionGridModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[60vh] overflow-y-auto p-2">
                  {questions.map((q, idx) => {
                    const isAns = selectedAnswers[idx] !== undefined;
                    const isFlg = flaggedQuestions[idx];
                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowQuestionGridModal(false);
                        }}
                        className={`p-2.5 rounded font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                          idx === currentIndex
                            ? 'bg-[#444444] text-white border-slate-700'
                            : isAns
                            ? 'bg-[#76b82a] text-white border-lime-700'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlg && <Flag className="w-3 h-3 text-amber-300 fill-amber-300" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowQuestionGridModal(false)}
                    className="bg-[#444444] text-white font-bold px-4 py-1.5 rounded text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PHASE 4: OFFICIAL PROMETRIC RESULT & REVIEW SCREEN
  // --------------------------------------------------------------------------
  const score = calculateScore();

  return (
    <div className="fixed inset-0 bg-[#c5d1d6] z-50 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Prometric Official Report Header */}
        <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden">
          <div className="bg-[#444444] text-white p-6 flex items-center justify-between border-b border-slate-600">
            <div>
              <span className="font-mono text-xs font-bold text-[#76b82a] uppercase tracking-widest block mb-1">
                PROMETRIC OFFICIAL SCORE REPORT
              </span>
              <h2 className="font-display font-extrabold text-xl text-white">
                {course.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetakeRandomExam}
                className="bg-[#76b82a] hover:bg-[#68a424] text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thi lại (Random Đề mới)</span>
              </button>
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" /> Close Exam
              </button>
            </div>
          </div>

          {/* Score Summary Box */}
          <div className="p-8 space-y-6">
            <div className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              score.passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-4">
                {score.passed ? (
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-extrabold text-2xl">
                    {score.passed ? 'PASSED — CERTIFIED!' : 'NOT PASSED'}
                  </h3>
                  <p className="text-xs font-medium opacity-90 mt-1">
                    Passing score requirement: <strong>70%</strong>. Your score: <strong>{score.scorePct}%</strong>
                  </p>
                </div>
              </div>

              <div className="text-right font-mono border-l sm:border-l-0 sm:border-t-0 pl-4 sm:pl-0">
                <span className="text-3xl font-black">{score.scorePct}%</span>
                <p className="text-xs opacity-80">{score.correctCount} of {score.total} Correct</p>
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Candidate Email</span>
                <strong className="text-slate-900 truncate block">{candidateEmail}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Total Questions</span>
                <strong className="text-slate-900">{score.total} Items</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Correct Answers</span>
                <strong className="text-emerald-700 font-bold">{score.correctCount}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Time Spent</span>
                <strong className="text-slate-900">{formatTime((questions.length * 90) - timeLeft)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review & AI Explanations */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#76b82a]" />
            Detailed Question Review & Official Answer Keys
          </h3>

          {questions.map((q, idx) => {
            const userAns = selectedAnswers[idx];
            const isCorrect = userAns === q.correctAnswer;
            const aiExp = aiExplanations[idx];

            return (
              <div
                key={q.id || idx}
                className={`bg-white rounded-xl p-6 shadow border-2 space-y-4 ${
                  isCorrect ? 'border-emerald-300' : 'border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                      Question {idx + 1}
                    </span>
                    <p className="font-medium text-slate-900 text-sm whitespace-pre-line leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-xs font-extrabold px-3 py-1 rounded shrink-0 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>

                {/* Choices Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.choices.map((choice) => {
                    const isUserChoice = userAns === choice.key;
                    const isCorrectChoice = q.correctAnswer === choice.key;

                    let bgStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrectChoice) bgStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                    else if (isUserChoice && !isCorrect) bgStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';

                    return (
                      <div key={choice.key} className={`p-3 rounded border text-xs flex items-center gap-3 ${bgStyle}`}>
                        <span className="font-mono font-bold w-6 text-center">{choice.key}.</span>
                        <span className="flex-1">{choice.text}</span>
                        {isCorrectChoice && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isUserChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Official Explanation Box */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-2 text-slate-800">
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                    Official OutSystems Explanation:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>

                {/* AI Tutor Button & Output */}
                <div className="pt-1">
                  {aiExp ? (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded text-xs text-blue-950 space-y-1.5">
                      <span className="font-bold text-blue-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" /> AI Tutor Insight:
                      </span>
                      <p className="leading-relaxed">{aiExp}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFetchAiExplanation(idx, q)}
                      disabled={loadingAi[idx]}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {loadingAi[idx] ? 'Consulting AI Tutor...' : 'Ask AI Tutor for Explanation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
