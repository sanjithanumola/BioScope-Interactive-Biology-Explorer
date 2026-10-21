import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../data/biologyData';
import { QuizQuestion, UserProgress } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Trophy,
  Info,
} from 'lucide-react';

interface QuizzesEngineProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const QuizzesEngine: React.FC<QuizzesEngineProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(false);

  // Active Quiz Run State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Filter pool
  const filteredPool = QUIZ_QUESTIONS.filter((q) => {
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const currentQuestion = currentQuestions[currentIndex];

  // Optional timer countdown
  useEffect(() => {
    if (!quizActive || quizFinished || !isTimerEnabled || isAnswerSubmitted) return;

    if (timeLeft <= 0) {
      // Auto-submit incorrect on time expiry
      handleSelectOption(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizActive, quizFinished, isTimerEnabled, isAnswerSubmitted, timeLeft]);

  const handleStartQuiz = () => {
    sound.playClick();
    const questions = [...filteredPool].sort(() => Math.random() - 0.5).slice(0, 8);
    if (questions.length === 0) return;

    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
    setTimeLeft(30);
    setQuizActive(true);

    onUpdateProgress((prev) => ({
      ...prev,
      lastVisitedSection: 'quizzes',
    }));
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQuestion.correctAnswer;
    if (isCorrect) {
      sound.playSuccess();
      setScore((s) => s + 1);
    } else {
      sound.playError();
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const finalScore = score + (selectedAnswer === currentQuestion?.correctAnswer ? 0 : 0);
    const total = currentQuestions.length;
    const percentage = Math.round((finalScore / total) * 100);
    const xpEarned = finalScore * 20 + 20;

    onUpdateProgress((prev) => {
      const unlocked = [...prev.unlockedAchievements];
      let bonusXp = 0;

      if (!unlocked.includes('quiz_novice')) {
        unlocked.push('quiz_novice');
        bonusXp += 50;
      }
      if (percentage === 100 && !unlocked.includes('perfect_score')) {
        unlocked.push('perfect_score');
        bonusXp += 150;
      }

      const newHistoryItem = {
        id: `quiz_${Date.now()}`,
        topic: selectedTopic === 'all' ? 'Comprehensive Biology' : selectedTopic,
        score: finalScore,
        total,
        percentage,
        date: new Date().toLocaleDateString(),
      };

      return {
        ...prev,
        xp: prev.xp + xpEarned + bonusXp,
        quizHistory: [newHistoryItem, ...prev.quizHistory.slice(0, 19)],
        unlockedAchievements: unlocked,
      };
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span>Biology Knowledge Quizzes</span>
          <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Assessment & XP
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Test your grasp of human anatomy, cell structures, DNA base-pairing, and physiological systems with instant scientific explanations.
        </p>
      </div>

      {!quizActive ? (
        /* Quiz Setup Configuration Screen */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Configure Your Quiz Session</h2>
            <p className="text-xs text-slate-400">
              Select your preferred biological domain, difficulty level, and optional pacing timer.
            </p>
          </div>

          {/* Topic Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Biology Topic:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Topics' },
                { id: 'anatomy', label: 'Human Anatomy' },
                { id: 'cell', label: 'Cell Biology' },
                { id: 'dna', label: 'DNA & Genetics' },
                { id: 'systems', label: 'Body Systems' },
                { id: 'microscopic', label: 'Microscopic World' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedTopic(t.id);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedTopic === t.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Difficulty Setting:</label>
            <div className="grid grid-cols-4 gap-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDifficulty(d);
                  }}
                  className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                    selectedDifficulty === d
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Timed Challenge (30s per question)</p>
                <p className="text-[11px] text-slate-400">Adds an extra challenge for quick recall</p>
              </div>
            </div>
            <button
              onClick={() => setIsTimerEnabled(!isTimerEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isTimerEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isTimerEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartQuiz}
            disabled={filteredPool.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-transform hover:scale-101 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Biology Quiz ({Math.min(8, filteredPool.length)} Questions)</span>
          </button>
        </div>
      ) : quizFinished ? (
        /* Quiz Finished Score Card */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400">
              Your results have been saved to your learning progress dashboard.
            </p>
          </div>

          {/* Score Circle / Stats */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 max-w-sm mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Final Score</span>
              <span className="font-mono font-bold text-xl text-white">
                {score} / {currentQuestions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-amber-400"
                style={{ width: `${Math.round((score / currentQuestions.length) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-mono">Accuracy: {Math.round((score / currentQuestions.length) * 100)}%</span>
              <span className="text-amber-400 font-mono font-bold">+{score * 20 + 20} XP Earned</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStartQuiz}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => setQuizActive(false)}
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Configure Another Topic
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Runner */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
            <span className="font-mono text-slate-400">
              Question {currentIndex + 1} of {currentQuestions.length}
            </span>
            <div className="flex items-center gap-4">
              {isTimerEnabled && (
                <span className={`font-mono font-bold flex items-center gap-1 ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </span>
              )}
              <span className="font-mono text-teal-400">Score: {score}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-teal-400">
              Topic: {currentQuestion.topic} · {currentQuestion.difficulty}
            </span>
            <h2 className="text-lg font-bold text-white leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-3.5 text-xs rounded-xl border transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Immediate Scientific Explanation */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fadeIn">
              <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Scientific Explanation</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
              <button
                onClick={handleNextQuestion}
                className="mt-3 w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>{currentIndex < currentQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
