import React, { useState } from 'react';
import { MockExamQuestion } from '../types';
import { Check, X, HelpCircle, Loader2, Sparkles, RefreshCw, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockExamProps {
  courseTitle: string;
  questions: MockExamQuestion[];
}

export default function MockExam({ courseTitle, questions }: MockExamProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [showExplanationPanel, setShowExplanationPanel] = useState<Record<string, boolean>>({});

  const currentQuestion = questions[currentIdx];
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
      console.error(err);
      setAiExplanations((prev) => ({
        ...prev,
        [questionId]: 'Could not contact the AI Tutor. Please verify your connection or try again later.'
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto my-4 shadow-sm animate-in fade-in zoom-in-95 duration-250">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <BookOpen className="w-8 h-8" />
        </div>
        
        <h3 className="font-display font-semibold text-2xl text-slate-900 mb-2">
          Practice Test Completed!
        </h3>
        <p className="text-slate-500 text-sm mb-6 font-medium">
          You have completed the mini-mock diagnostic exam for {courseTitle}.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-sm mx-auto mb-8">
          <div className="text-5xl font-extrabold text-slate-900 mb-2 font-display">
            {score} <span className="text-slate-400 text-2xl font-sans font-medium">/ {questions.length}</span>
          </div>
          <div className="text-xs font-bold tracking-wider uppercase mb-4 text-slate-500">
            Final Score: <span className={passed ? "text-emerald-600" : "text-amber-600"}>{percentage}%</span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {passed ? "Excellent! You are on track to pass the official exam." : "We recommend reviewing the explanation materials below and retaking."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={handleRestart}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retake Practice Test
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
            Exam Practice Simulator
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-2.5 font-sans">
            {courseTitle}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Question {currentIdx + 1} of {questions.length}
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
                'Finish Quiz'
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
