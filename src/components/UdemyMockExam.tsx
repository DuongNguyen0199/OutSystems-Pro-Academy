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
  Image as ImageIcon
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(questions.length * 90); // 90 seconds per question
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState<boolean>(false);

  // AI Tutor explanation states
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<number, boolean>>({});

  // Countdown timer effect
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const currentQ = questions[currentIndex];

  const handleSelectChoice = (choiceKey: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: choiceKey
    }));
  };

  const toggleFlag = (index: number) => {
    if (isSubmitted) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFetchAiExplanation = async (idx: number, q: MockExamQuestion) => {
    if (aiExplanations[idx] || loadingAi[idx]) return;

    setLoadingAi((prev) => ({ ...prev, [idx]: true }));

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: course.title,
          question: q.question,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          userAnswer: selectedAnswers[idx] || 'Not Answered'
        })
      });

      const data = await res.json();
      if (data && data.explanation) {
        setAiExplanations((prev) => ({ ...prev, [idx]: data.explanation }));
      }
    } catch (err) {
      setAiExplanations((prev) => ({
        ...prev,
        [idx]: `AI Explanation: Choice ${q.correctAnswer} is correct because ${q.explanation}`
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const scoreResult = isSubmitted ? calculateScore() : null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans text-slate-900 select-none overflow-hidden">
      
      {/* 1. UDEMY HEADER */}
      <header className="bg-slate-900 text-white px-4 md:px-8 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-sm md:text-base tracking-tight truncate max-w-xs sm:max-w-md">
              {course.title} — Udemy Practice Test Mode
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          {!isSubmitted && (
            <div className="flex items-center gap-1.5 bg-slate-800 text-amber-300 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Question Grid Toggle for Mobile */}
          <button
            onClick={() => setShowQuestionGrid(!showQuestionGrid)}
            className="md:hidden bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer"
            >
              Finish Test
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </header>

      {/* MAIN EXAM BODY */}
      {!isSubmitted ? (
        <div className="flex-1 flex overflow-hidden">
          
          {/* QUESTION CARD AREA */}
          <div className="flex-1 p-4 md:p-10 overflow-y-auto bg-slate-100 flex flex-col justify-between">
            <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
              
              {/* Question Header & Flag Button */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white text-xs font-extrabold px-3 py-1 rounded-lg">
                    Question {currentIndex + 1}
                  </span>
                  {flaggedQuestions[currentIndex] && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                      <Flag className="w-3 h-3 fill-amber-600 text-amber-600" />
                      Marked for Review
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleFlag(currentIndex)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    flaggedQuestions[currentIndex]
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentIndex] ? 'fill-white' : ''}`} />
                  <span>{flaggedQuestions[currentIndex] ? 'Unmark Flag' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="font-display font-semibold text-base md:text-lg text-slate-900 leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Question Image Diagram (if available) */}
              {currentQ.imageUrl && (
                <div className="my-4 p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-center">
                  <img
                    src={currentQ.imageUrl}
                    alt="OutSystems Architecture Diagram"
                    className="max-h-72 mx-auto object-contain rounded-lg shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-center gap-1">
                    <ImageIcon className="w-3 h-3" /> OutSystems System Reference Diagram
                  </p>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedAnswers[currentIndex] === choice.key;
                  return (
                    <button
                      key={choice.key}
                      onClick={() => handleSelectChoice(choice.key)}
                      className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-semibold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {choice.key}
                      </div>
                      <span className="mt-0.5 leading-relaxed">{choice.text}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom Navigation Buttons */}
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between pt-6">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-3xs cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <div className="text-xs font-semibold text-slate-500">
                {Object.keys(selectedAnswers).length} of {questions.length} Answered
              </div>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md cursor-pointer transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. RIGHT UDEMY QUESTION NAVIGATION GRID (1..50) */}
          <aside className={`w-72 bg-white border-l border-slate-200 p-4 flex flex-col justify-between overflow-y-auto shrink-0 md:block ${
            showQuestionGrid ? 'block absolute inset-y-0 right-0 z-40 shadow-2xl' : 'hidden md:block'
          }`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Question Navigation
                </h4>
                <button
                  onClick={() => setShowQuestionGrid(false)}
                  className="md:hidden text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-200 rounded-xs"></span>
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-xs"></span>
                  <span>Flagged for Review</span>
                </div>
              </div>

              {/* Question Number Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {questions.map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isFlagged = flaggedQuestions[idx];

                  let btnBg = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                  if (isFlagged) {
                    btnBg = 'bg-amber-500 text-white border-amber-600 font-bold';
                  } else if (isAnswered) {
                    btnBg = 'bg-blue-600 text-white border-blue-700 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowQuestionGrid(false);
                      }}
                      className={`h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer relative ${btnBg} ${
                        isCurrent ? 'ring-3 ring-slate-900 ring-offset-1' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Submit & Finish Test
              </button>
            </div>
          </aside>

        </div>
      ) : (
        /* 3. UDEMY RESULT & SCORE DASHBOARD */
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-100">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* SCORE CARD */}
            <div className={`p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border ${
              scoreResult?.passed
                ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-700'
                : 'bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 border-red-700'
            }`}>
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-xs">
                  <Award className="w-4 h-4 text-amber-300" />
                  Official Exam Evaluation
                </div>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white">
                  {scoreResult?.passed ? 'Congratulations! You Passed!' : 'Keep Practicing! Test Result'}
                </h2>
                <p className="text-slate-300 text-xs md:text-sm font-medium">
                  {scoreResult?.passed
                    ? 'You have met the required passing threshold (70%) for this OutSystems practice exam.'
                    : 'Passing score is 70%. Review your incorrect answers below and retake the test.'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center shrink-0 w-full md:w-48 flex flex-col items-center">
                <div className="text-4xl font-extrabold font-display">
                  {scoreResult?.scorePct}%
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">
                  {scoreResult?.correctCount} / {scoreResult?.total} Correct
                </div>
                <div className={`mt-2 text-xs font-extrabold py-1 px-3 rounded-full ${
                  scoreResult?.passed ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
                }`}>
                  {scoreResult?.passed ? 'PASSED' : 'FAILED'}
                </div>

                {scoreResult?.passed && (
                  <button
                    onClick={() => window.print()}
                    className="mt-3 bg-white text-slate-900 font-bold text-[11px] py-1.5 px-3 rounded-lg shadow-xs hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Print PDF Report
                  </button>
                )}
              </div>
            </div>

            {/* DETAILED ANSWER REVIEW */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-display font-extrabold text-lg text-slate-900">
                  Detailed Answers & Explanations
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Reviewing all {questions.length} questions
                </span>
              </div>

              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctAnswer;

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border text-xs md:text-sm space-y-3 transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <h4 className="font-display font-semibold text-slate-900">
                            {q.question}
                          </h4>
                        </div>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>

                      {/* Image Diagram */}
                      {q.imageUrl && (
                        <div className="my-2 p-2 bg-white border border-slate-200 rounded-xl max-w-md">
                          <img src={q.imageUrl} alt="Diagram" className="max-h-48 rounded-lg object-contain" />
                        </div>
                      )}

                      {/* Choices Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {q.choices.map((c) => {
                          const isUserChoice = userAns === c.key;
                          const isRightChoice = q.correctAnswer === c.key;

                          let choiceStyle = 'bg-white text-slate-700 border-slate-200';
                          if (isRightChoice) {
                            choiceStyle = 'bg-emerald-100 text-emerald-950 border-emerald-400 font-semibold';
                          } else if (isUserChoice && !isRightChoice) {
                            choiceStyle = 'bg-rose-100 text-rose-950 border-rose-400 font-semibold';
                          }

                          return (
                            <div key={c.key} className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${choiceStyle}`}>
                              <span className="font-bold">{c.key}.</span>
                              <span>{c.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reference Explanation */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <strong className="text-slate-900 font-bold">Official Explanation:</strong>
                        <p className="leading-relaxed text-slate-600">{q.explanation}</p>
                      </div>

                      {/* Gemini AI Tutor Button */}
                      <div className="pt-1">
                        {!aiExplanations[idx] ? (
                          <button
                            onClick={() => handleFetchAiExplanation(idx, q)}
                            disabled={loadingAi[idx]}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{loadingAi[idx] ? 'Consulting AI Tutor...' : 'Ask AI Tutor for Detailed Breakdown'}</span>
                          </button>
                        ) : (
                          <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-950 space-y-1">
                            <strong className="font-bold flex items-center gap-1.5 text-indigo-900">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              AI Tutor Analysis:
                            </strong>
                            <p className="leading-relaxed whitespace-pre-line text-indigo-900 font-medium">
                              {aiExplanations[idx]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC WATERMARK OVERLAY (MODULE 1: ANTI-PIRACY PROTECTION) */}
      <div className="pointer-events-none fixed inset-0 z-30 flex flex-wrap justify-around items-center opacity-15 overflow-hidden select-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="transform -rotate-45 text-[11px] font-mono font-bold text-slate-900 tracking-widest whitespace-nowrap p-8">
            OUTSYSTEMS DUMP • STUDENT ACCESS • {new Date().toLocaleDateString()}
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL BEFORE SUBMITTING */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
            <h3 className="font-display font-bold text-lg text-slate-900">
              Are you sure you want to finish?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You have answered <strong>{Object.keys(selectedAnswers).length}</strong> out of <strong>{questions.length}</strong> questions. Unanswered questions will be marked incorrect.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setIsSubmitted(true);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

