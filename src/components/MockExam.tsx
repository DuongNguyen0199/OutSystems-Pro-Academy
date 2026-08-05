import React, { useState } from 'react';
import { MockExamQuestion } from '../types';
import { Check, X, HelpCircle, Loader2, Sparkles, RefreshCw, ChevronRight, Key, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockExamProps {
  courseTitle: string;
  questions: MockExamQuestion[];
  totalAvailableQuestions?: number;
  onOpenActivation?: () => void;
  onOpenPayment?: () => void;
}

export default function MockExam({
  courseTitle,
  questions,
  totalAvailableQuestions = 100,
  onOpenActivation,
  onOpenPayment,
}: MockExamProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [showExplanationPanel, setShowExplanationPanel] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <p className="text-xs font-bold text-slate-600">
          No preview questions available for this course yet.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx] || questions[0];
  const hasAnsweredCurrent = currentQuestion ? !!submittedAnswers[currentQuestion.id] : false;
  const selectedForCurrent = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleSelectChoice = (choiceKey: string) => {
    if (hasAnsweredCurrent) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceKey
    }));
  };

  const handleSubmitAnswer = () => {
    if (!selectedForCurrent || hasAnsweredCurrent) return;

    const isCorrect = selectedForCurrent === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setSubmittedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: true
    }));

    setShowExplanationPanel((prev) => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setScore(0);
    setIsFinished(false);
    setAiExplanations({});
    setLoadingAi({});
    setShowExplanationPanel({});
  };

  const askAiTutor = async (questionId: string) => {
    if (loadingAi[questionId]) return;

    setLoadingAi((prev) => ({ ...prev, [questionId]: true }));
    const q = questions.find((item) => item.id === questionId);
    if (!q) return;

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle,
          question: q.question,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          userAnswer: selectedAnswers[questionId] || 'None'
        })
      });

      const data = await response.json();
      if (data.explanation) {
        setAiExplanations((prev) => ({
          ...prev,
          [questionId]: data.explanation
        }));
      } else {
        setAiExplanations((prev) => ({
          ...prev,
          [questionId]: 'The AI Tutor is currently busy. Please read the standard explanation below.'
        }));
      }
    } catch (err) {
      setAiExplanations((prev) => ({
        ...prev,
        [questionId]: 'AI explanation connection unavailable.'
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 my-4 text-center space-y-6 shadow-xs animate-in zoom-in-95 duration-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" /> Free Preview 10-Question Demo Finished
          </div>
          <h4 className="font-display font-extrabold text-2xl text-slate-900">
            {courseTitle} — Demo Result
          </h4>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
            You got <strong className="text-slate-900">{score}</strong> out of <strong className="text-slate-900">{questions.length}</strong> preview questions correct ({percentage}%).
          </p>
        </div>

        {/* Lockout & Unlock Full Course Callout Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4 max-w-lg mx-auto text-left">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Lock className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <h5 className="font-display font-bold text-sm text-white">
                Unlock Full Exam ({totalAvailableQuestions}+ Real Questions)
              </h5>
              <p className="text-[11px] text-slate-400 font-medium">
                Access full 50-question Udemy practice test mode & detailed AI Tutor.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {onOpenActivation && (
              <button
                onClick={onOpenActivation}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-300" /> Enter Activation Code
              </button>
            )}

            {onOpenPayment && (
              <button
                onClick={onOpenPayment}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Buy Full Course
              </button>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleRestart}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake 10-Question Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 md:p-6 my-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-md">
            Free Preview Quiz Mode
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-2.5 font-sans">
            {courseTitle}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Preview {currentIdx + 1} of {questions.length}
          </span>
          <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h5 className="font-display font-semibold text-base md:text-lg text-slate-900 leading-snug">
          {currentQuestion.question}
        </h5>
      </div>

      <div className="space-y-3 mb-6">
        {currentQuestion.choices.map((choice) => {
          const isSelected = selectedForCurrent === choice.key;
          const isCorrect = choice.key === currentQuestion.correctAnswer;
          const showSuccess = hasAnsweredCurrent && isCorrect;
          const showFailure = hasAnsweredCurrent && isSelected && !isCorrect;

          let btnClass = "border-slate-200 hover:border-slate-300 bg-white text-slate-800";
          if (isSelected && !hasAnsweredCurrent) {
            btnClass = "border-blue-600 bg-blue-50/30 text-blue-900 font-semibold";
          } else if (showSuccess) {
            btnClass = "border-emerald-500 bg-emerald-50/30 text-emerald-900 font-semibold";
          } else if (showFailure) {
            btnClass = "border-red-500 bg-red-50/30 text-red-900 font-semibold";
          }

          return (
            <button
              key={choice.key}
              onClick={() => handleSelectChoice(choice.key)}
              disabled={hasAnsweredCurrent}
              className={`w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-all duration-150 cursor-pointer ${btnClass}`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5
                ${isSelected && !hasAnsweredCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' : ''}
                ${showSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                ${showFailure ? 'bg-red-600 border-red-600 text-white' : ''}
                ${!isSelected && !showSuccess ? 'border-slate-200 bg-slate-50 text-slate-500' : ''}
              `}>
                {showSuccess ? <Check className="w-3.5 h-3.5" /> : showFailure ? <X className="w-3.5 h-3.5" /> : choice.key}
              </div>
              <span className="text-sm leading-relaxed font-sans font-medium">{choice.text}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <div>
          {hasAnsweredCurrent && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
              ${selectedForCurrent === currentQuestion.correctAnswer 
                ? 'bg-emerald-50 border-emerald-150 text-emerald-700' 
                : 'bg-red-50 border-red-150 text-red-700'
              }
            `}>
              {selectedForCurrent === currentQuestion.correctAnswer ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Correct Answer
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" /> Incorrect
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {!hasAnsweredCurrent ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedForCurrent}
              className={`font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-xs ${
                selectedForCurrent 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {currentIdx < questions.length - 1 ? (
                <>
                  Next Question <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                'Finish Demo Quiz'
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasAnsweredCurrent && showExplanationPanel[currentQuestion.id] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-5"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-5 mt-2 space-y-4 shadow-3xs">
              <div>
                <h6 className="font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" /> Explanation Details
                </h6>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl font-medium font-sans">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* AI Tutor Assistant block */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">AI Study Tutor</p>
                      <p className="text-[10px] text-slate-400 font-medium">Deep study analysis using Gemini 3.5</p>
                    </div>
                  </div>

                  {!aiExplanations[currentQuestion.id] && !loadingAi[currentQuestion.id] && (
                    <button
                      onClick={() => askAiTutor(currentQuestion.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-150 px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-3xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Ask AI to Explain Deeper
                    </button>
                  )}
                </div>

                {loadingAi[currentQuestion.id] && (
                  <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold py-3.5 bg-purple-50/20 rounded-xl border border-purple-100/30 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Analyzing architectural concepts with Gemini AI...</span>
                  </div>
                )}

                {aiExplanations[currentQuestion.id] && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-700 leading-relaxed bg-purple-50/20 border border-purple-100/30 p-4 rounded-xl space-y-2 font-medium"
                  >
                    <div className="flex items-center gap-1 text-purple-800 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Custom AI Tutor Response</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-slate-800 font-sans">
                      {aiExplanations[currentQuestion.id]}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
