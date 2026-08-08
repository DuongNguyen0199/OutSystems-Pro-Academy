import React, { useState, useEffect } from 'react';
import { Course, MockExamQuestion } from '../types';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  AlertCircle,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Check,
  Settings,
  Grid
} from 'lucide-react';

interface UdemyMockExamProps {
  course: Course;
  onClose: () => void;
}

export default function UdemyMockExam({ course, onClose }: UdemyMockExamProps) {
  const questions: MockExamQuestion[] = course.mockExam && course.mockExam.length > 0
    ? course.mockExam
    : [
        {
          id: 'q1',
          question: 'In OutSystems Reactive Web Apps, which lifecycle event is triggered before the screen is rendered and before any data aggregates begin fetching?',
          choices: [
            { key: 'A', text: 'On Render' },
            { key: 'B', text: 'On Initialize' },
            { key: 'C', text: 'On Ready' },
            { key: 'D', text: 'On Destroy' }
          ],
          correctAnswer: 'B',
          explanation: 'On Initialize is the first screen lifecycle event. It executes before screen rendering and before data aggregates start fetching, making it ideal for setting up initial local variables.'
        }
      ];

  // Exam Phases: 'confirm_details' -> 'intro' -> 'exam' -> 'result'
  const [examPhase, setExamPhase] = useState<'confirm_details' | 'intro' | 'exam' | 'result'>('confirm_details');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(questions.length * 90); // 90s per question
  const [introTimeLeft, setIntroTimeLeft] = useState<number>(15 * 60); // 15 mins for intro
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState<boolean>(false);
  const [showQuestionGridModal, setShowQuestionGridModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // User candidate info
  const savedUserStr = localStorage.getItem('outsystems_user');
  let candidateEmail = 'USER Demo';
  if (savedUserStr) {
    try {
      const u = JSON.parse(savedUserStr);
      if (u.email) candidateEmail = u.email;
    } catch (e) {}
  }

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

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= 70;
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
  // PHASE 1: CONFIRM DETAILS SCREEN (Prometric Screenshot 3)
  // --------------------------------------------------------------------------
  if (examPhase === 'confirm_details') {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-xl shadow-2xl overflow-hidden border border-slate-300">
          {/* Header */}
          <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between font-mono text-sm">
            <span className="font-bold">Confirm Details</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-extrabold">
              <Clock className="w-4 h-4" /> 00:02:00
            </span>
          </div>

          <div className="p-8 space-y-6">
            {/* Prometric Header Logos */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-extrabold text-sm shadow">
                  OS
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-sm">OutSystems Pro Academy</h4>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Official Dumps Center</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-lime-700 tracking-widest text-lg">PROMETRIC</span>
                <p className="text-[10px] text-slate-400 font-mono">TESTING CENTER SIMULATION</p>
              </div>
            </div>

            {/* Candidate Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3 font-mono text-xs text-slate-700">
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
                  className="bg-lime-600 hover:bg-lime-500 text-white font-bold px-8 py-2.5 rounded shadow transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Check className="w-4 h-4" /> Confirm
                </button>
                <button
                  onClick={onClose}
                  className="bg-lime-600 hover:bg-lime-500 text-white font-bold px-8 py-2.5 rounded shadow transition-all flex items-center gap-2 cursor-pointer text-sm"
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
      <div className="fixed inset-0 bg-slate-200 z-50 flex flex-col font-sans select-none">
        {/* Top Header Bar */}
        <header className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-900 shadow">
          <div>
            <span className="font-bold">Page: 1</span>
            <span className="mx-2 text-slate-500">|</span>
            <span>Section: Introduction</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Introduction Time Remaining: {formatTime(introTimeLeft)}</span>
            </div>
            <div className="bg-slate-700 rounded-full h-3 w-32 overflow-hidden border border-slate-600">
              <div className="bg-lime-500 h-full w-[10%]" />
            </div>
            <span className="text-[11px] text-slate-400">Progress 0%</span>
          </div>

          <button
            onClick={() => setExamPhase('exam')}
            className="bg-amber-200 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1 rounded border-2 border-slate-900 shadow text-xs cursor-pointer"
          >
            Finish Test
          </button>
        </header>

        {/* Sub Header Green Bar */}
        <div className="bg-lime-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-sm">
          <span>Test: {course.title} Exam Simulation</span>
          <span>Candidate: {candidateEmail}</span>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
          {/* Left Vertical Section Tabs */}
          <div className="w-14 flex flex-col gap-1 overflow-y-auto pr-1">
            {Array.from({ length: Math.min(16, questions.length) }).map((_, i) => (
              <div
                key={i}
                className={`py-2 px-1 text-center font-extrabold text-xs text-white rounded-l relative flex items-center justify-center ${
                  i === 0 ? 'bg-lime-600 shadow' : 'bg-lime-700/80 hover:bg-lime-600'
                }`}
              >
                <span>{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Center Main Introduction White Container */}
          <div className="flex-1 bg-white border border-slate-300 rounded p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed shadow-sm">
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
        <footer className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-t-2 border-lime-600 text-xs">
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Question Matrix Grid">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Help Instructions">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setExamPhase('confirm_details')}
              className="bg-lime-700 hover:bg-lime-600 text-white font-bold px-4 py-2 rounded text-xs cursor-pointer flex items-center gap-1"
            >
              &lt; Previous
            </button>
            <button
              onClick={() => setExamPhase('exam')}
              className="bg-lime-700 hover:bg-lime-600 text-white font-bold px-4 py-2 rounded text-xs cursor-pointer flex items-center gap-1"
            >
              Next &gt;
            </button>
            <button
              onClick={() => setExamPhase('exam')}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold px-6 py-2 rounded shadow text-xs cursor-pointer flex items-center gap-1"
            >
              Start the Test &gt;
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PHASE 3: LIVE PROMETRIC QUESTION EXAM SCREEN (Prometric Screenshot 2)
  // --------------------------------------------------------------------------
  if (examPhase === 'exam' && !isSubmitted) {
    const answeredCount = Object.keys(selectedAnswers).length;
    const isCurrentFlagged = flaggedQuestions[currentIndex];

    return (
      <div className="fixed inset-0 bg-slate-200 z-50 flex flex-col font-sans select-none">
        {/* Top Header Bar */}
        <header className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-900 shadow">
          <div>
            <span className="font-bold">Page: {currentIndex + 1} of {questions.length}</span>
            <span className="mx-2 text-slate-500">|</span>
            <span>Section: 1</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-amber-300">
              Total Test Time Remaining: {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmFinishModal(true)}
            className="bg-amber-200 hover:bg-amber-300 text-slate-950 font-bold px-5 py-1.5 rounded border-2 border-slate-900 shadow text-xs cursor-pointer transition-all hover:scale-105"
          >
            Finish Test
          </button>
        </header>

        {/* Sub Header Green Bar */}
        <div className="bg-lime-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm">
          <span>Test: {course.title}</span>
          <span>Candidate: {candidateEmail}</span>
        </div>

        {/* Main Workspace: Left Vertical Navigator + Center Question Display */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
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
                  className={`w-full py-2 px-1 rounded-l text-xs font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-lime-600 text-white shadow-md border-r-4 border-slate-900 font-black'
                      : isAnswered
                      ? 'bg-slate-700 text-blue-200 hover:bg-slate-600'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isFlagged ? (
                      <Flag className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    ) : isAnswered ? (
                      <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : null}
                    <span>{idx + 1}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center Main Question White Container */}
          <div className="flex-1 bg-white border border-slate-300 rounded p-6 overflow-y-auto flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              {/* Question Text Box (Prometric Light Gray Rounded Box) */}
              <div className="bg-slate-100 border border-slate-200 rounded p-5 text-slate-900 font-medium text-sm leading-relaxed shadow-xs">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-2 font-mono">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <p className="text-slate-900 font-medium whitespace-pre-line leading-relaxed">
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

              {/* Choices A, B, C, D Rectangular White Boxes */}
              <div className="space-y-3 pt-2">
                {currentQ.choices.map((choice) => {
                  const isChoiceSelected = selectedAnswers[currentIndex] === choice.key;
                  return (
                    <div
                      key={choice.key}
                      onClick={() => handleSelectChoice(choice.key)}
                      className={`border-2 rounded p-4 flex items-center gap-4 transition-all cursor-pointer select-none ${
                        isChoiceSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-md'
                          : 'border-slate-800 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded font-extrabold text-xs flex items-center justify-center font-mono shrink-0 ${
                          isChoiceSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {choice.key}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 flex-1 leading-snug">
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
        <footer className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-t-2 border-lime-600 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQuestionGridModal(true)}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
              title="Question Matrix Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
              title="Help Instructions"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFlag(currentIndex)}
              className={`px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                isCurrentFlagged
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-lime-700 hover:bg-lime-600 text-white'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-slate-950' : ''}`} />
              <span>{isCurrentFlagged ? 'Flagged' : 'Flag Question'}</span>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`px-4 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center gap-1 ${
                currentIndex === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-lime-700 hover:bg-lime-600 text-white'
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
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold px-6 py-1.5 rounded shadow text-xs cursor-pointer flex items-center gap-1"
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
                  className="bg-lime-600 hover:bg-lime-500 text-white font-bold px-5 py-2 rounded text-xs shadow cursor-pointer"
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
                  <Grid className="w-5 h-5 text-lime-600" />
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
                          ? 'bg-lime-600 text-white border-lime-700'
                          : isAns
                          ? 'bg-slate-700 text-blue-200 border-slate-800'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isFlg && <Flag className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowQuestionGridModal(false)}
                  className="bg-slate-800 text-white font-bold px-4 py-1.5 rounded text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // PHASE 4: OFFICIAL PROMETRIC RESULT & REVIEW SCREEN
  // --------------------------------------------------------------------------
  const score = calculateScore();

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Prometric Official Report Header */}
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold text-lime-400 uppercase tracking-widest block mb-1">
                PROMETRIC OFFICIAL SCORE REPORT
              </span>
              <h2 className="font-display font-extrabold text-xl text-white">
                {course.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded text-xs flex items-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" /> Close Exam
            </button>
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
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-lime-400" />
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
