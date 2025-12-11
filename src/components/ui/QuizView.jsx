import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Brain, Trophy, Zap, BookOpen, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import QuizCard from './QuizCard';
import QuizResults from './QuizResults';
import { quizService, MODULE_ORDER, MODULE_NAMES } from '../../services/QuizService';

/**
 * QuizView - Main quiz interface with spaced repetition
 * 
 * Features:
 * - Module-based progression (master Module 1 → Module 2 → etc.)
 * - Spaced repetition for missed questions
 * - Progress tracking and celebration
 */
const QuizView = ({ onComplete }) => {
    const [mode, setMode] = useState('welcome'); // 'welcome', 'quiz', 'results'
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, missed: [] });
    const [progressSummary, setProgressSummary] = useState(null);

    // Load progress on mount
    useEffect(() => {
        updateProgressSummary();
    }, []);

    const updateProgressSummary = () => {
        const summary = quizService.getProgressSummary();
        setProgressSummary(summary);
    };

    const startQuiz = useCallback(() => {
        const nextQuestions = quizService.getNextQuestions(10);

        if (nextQuestions.length === 0) {
            // No questions available (all mastered for current module)
            return;
        }

        setQuestions(nextQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setSessionStats({ correct: 0, total: 0, missed: [] });
        setMode('quiz');
    }, []);

    const handleAnswer = useCallback((questionId, selectedIndex, isCorrect) => {
        // Record with spaced repetition service
        quizService.recordAnswer(questionId, isCorrect);

        // Track in session
        setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }));

        setSessionStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            missed: isCorrect ? prev.missed : [...prev.missed, questions.find(q => q.id === questionId)]
        }));
    }, [questions]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Quiz complete
            const result = quizService.completeSession(sessionStats.correct);
            updateProgressSummary();
            setSessionStats(prev => ({
                ...prev,
                moduleAdvanced: result.moduleAdvanced,
                newModuleName: result.newModuleName
            }));
            setMode('results');
        }
    }, [currentIndex, questions.length, sessionStats.correct]);

    const reviewMissed = useCallback(() => {
        if (sessionStats.missed.length > 0) {
            setQuestions(sessionStats.missed);
            setCurrentIndex(0);
            setAnswers({});
            setSessionStats({ correct: 0, total: 0, missed: [] });
            setMode('quiz');
        }
    }, [sessionStats.missed]);

    // Current question
    const currentQuestion = questions[currentIndex];
    const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

    // Welcome Screen
    if (mode === 'welcome') {
        return (
            <div className="min-h-screen pb-20">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-4 lg:px-8 py-4">
                    <button
                        onClick={onComplete}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Learn</span>
                    </button>
                </div>

                <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                            <Brain className="w-10 h-10 text-purple-400" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
                            Quiz Yourself
                        </h1>
                        <p className="text-slate-400 max-w-lg mx-auto">
                            Test your knowledge with spaced repetition. Master each module before moving to the next.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    {progressSummary && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Mastered</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progressSummary.totalMastered}</div>
                                <div className="text-xs text-slate-500">of {progressSummary.totalQuestions}</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                                <div className="flex items-center gap-2 text-purple-400 mb-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Current Module</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progressSummary.currentModuleIndex}</div>
                                <div className="text-xs text-slate-500">of {progressSummary.totalModules}</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                                <div className="flex items-center gap-2 text-amber-400 mb-1">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Accuracy</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progressSummary.accuracy}%</div>
                                <div className="text-xs text-slate-500">{progressSummary.totalCorrect} correct</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                    <Trophy className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Best Streak</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progressSummary.bestStreak}</div>
                                <div className="text-xs text-slate-500">in a row</div>
                            </div>
                        </div>
                    )}

                    {/* Current Module Focus */}
                    {progressSummary?.currentModuleProgress && (
                        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30 mb-8">
                            <h3 className="text-lg font-bold text-white mb-2">
                                Current Focus: {progressSummary.currentModuleName}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Master all questions in this module to unlock the next one.
                            </p>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{ width: `${progressSummary.currentModuleProgress.percentComplete}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">
                                    {progressSummary.currentModuleProgress.mastered} / {progressSummary.currentModuleProgress.total} mastered
                                </span>
                                <span className="text-purple-400 font-medium">
                                    {progressSummary.currentModuleProgress.percentComplete}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Start Button */}
                    <div className="text-center mb-8">
                        <button
                            onClick={startQuiz}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-900/30 flex items-center gap-2 mx-auto"
                        >
                            Start Quiz
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <p className="mt-3 text-sm text-slate-500">
                            10 questions per session
                        </p>
                    </div>

                    {/* Module Progress Overview */}
                    {progressSummary?.allModulesProgress && (
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Module Progress
                            </h3>
                            <div className="space-y-3">
                                {progressSummary.allModulesProgress.map((module, index) => (
                                    <div
                                        key={module.moduleId}
                                        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${module.isCurrent
                                            ? 'bg-purple-500/10 border border-purple-500/30'
                                            : module.isUnlocked
                                                ? 'bg-slate-800/50'
                                                : 'bg-slate-800/20 opacity-50'
                                            }`}
                                    >
                                        {/* Module Number */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${module.isComplete
                                            ? 'bg-emerald-500 text-white'
                                            : module.isCurrent
                                                ? 'bg-purple-500 text-white'
                                                : module.isUnlocked
                                                    ? 'bg-slate-700 text-slate-300'
                                                    : 'bg-slate-800 text-slate-500'
                                            }`}>
                                            {module.isComplete ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : !module.isUnlocked ? (
                                                <Lock className="w-4 h-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        {/* Module Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium truncate ${module.isUnlocked ? 'text-white' : 'text-slate-500'
                                                }`}>
                                                {module.moduleName}
                                            </div>
                                            {module.isUnlocked && (
                                                <div className="text-xs text-slate-500">
                                                    {module.mastered} / {module.total} mastered
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {module.isUnlocked && (
                                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${module.isComplete
                                                        ? 'bg-emerald-500'
                                                        : 'bg-purple-500'
                                                        }`}
                                                    style={{ width: `${module.percentComplete}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Quiz Mode
    if (mode === 'quiz' && currentQuestion) {
        return (
            <div className="min-h-screen pb-20">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-4 lg:px-8 py-4">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => setMode('welcome')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Exit Quiz</span>
                        </button>

                        {/* Progress */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-400">
                                <span className="text-white font-bold">{currentIndex + 1}</span>
                                <span> / {questions.length}</span>
                            </div>
                            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">{sessionStats.correct}</span>
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="p-4 lg:p-8 max-w-2xl mx-auto">
                    <QuizCard
                        question={currentQuestion}
                        onAnswer={(index, isCorrect) => handleAnswer(currentQuestion.id, index, isCorrect)}
                        selectedAnswer={answers[currentQuestion.id]}
                        disabled={false}
                    />

                    {/* Next Button */}
                    {isAnswered && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={nextQuestion}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div >
        );
    }

    // Results Mode
    if (mode === 'results') {
        return (
            <div className="min-h-screen pb-20">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-4 lg:px-8 py-4">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-lg font-bold text-white text-center">Quiz Complete</h2>
                    </div>
                </div>

                <div className="p-4 lg:p-8">
                    <QuizResults
                        results={{
                            correct: sessionStats.correct,
                            total: sessionStats.total,
                            missed: sessionStats.missed,
                            moduleAdvanced: sessionStats.moduleAdvanced,
                            newModuleName: sessionStats.newModuleName
                        }}
                        moduleInfo={progressSummary}
                        onContinue={startQuiz}
                        onReviewMissed={reviewMissed}
                        onBackToLearn={onComplete}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default QuizView;
