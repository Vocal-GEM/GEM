import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Lightbulb } from 'lucide-react';

/**
 * QuizCard - Individual quiz question card with multiple choice answers
 */
const QuizCard = ({
    question,
    onAnswer,
    showResult = false,
    selectedAnswer = null,
    disabled = false
}) => {
    const [localSelected, setLocalSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);

    const selected = selectedAnswer !== null ? selectedAnswer : localSelected;
    const isAnswered = selected !== null;
    const isCorrect = selected === question.correctIndex;

    const handleSelect = (index) => {
        if (disabled || isAnswered) return;

        setLocalSelected(index);
        setRevealed(true);

        if (onAnswer) {
            onAnswer(index, index === question.correctIndex);
        }
    };

    const getOptionStyles = (index) => {
        const baseStyles = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3";

        if (!isAnswered) {
            return `${baseStyles} border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800 cursor-pointer`;
        }

        if (index === question.correctIndex) {
            return `${baseStyles} border-emerald-500 bg-emerald-500/10 text-emerald-300`;
        }

        if (index === selected && !isCorrect) {
            return `${baseStyles} border-red-500 bg-red-500/10 text-red-300`;
        }

        return `${baseStyles} border-slate-700/50 bg-slate-800/30 text-slate-500 opacity-60`;
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            {/* Module Tag */}
            <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                    {question.moduleName}
                </span>
            </div>

            {/* Question */}
            <div className="flex items-start gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <h3 className="text-lg font-medium text-white leading-relaxed">
                    {question.question}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        disabled={disabled || isAnswered}
                        className={getOptionStyles(index)}
                    >
                        {/* Option Label */}
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                            ${!isAnswered ? 'bg-slate-700 text-slate-300' :
                                index === question.correctIndex ? 'bg-emerald-500 text-white' :
                                    index === selected && !isCorrect ? 'bg-red-500 text-white' :
                                        'bg-slate-700/50 text-slate-500'
                            }`}
                        >
                            {isAnswered && index === question.correctIndex ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : isAnswered && index === selected && !isCorrect ? (
                                <XCircle className="w-5 h-5" />
                            ) : (
                                optionLabels[index]
                            )}
                        </span>

                        {/* Option Text */}
                        <span className={`flex-1 ${isAnswered && index !== question.correctIndex && index !== selected ? 'text-slate-500' : ''}`}>
                            {option}
                        </span>
                    </button>
                ))}
            </div>

            {/* Explanation (shown after answering) */}
            {isAnswered && revealed && (
                <div className={`mt-6 p-4 rounded-xl border ${isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <Lightbulb className={`w-5 h-5 shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <div>
                            <div className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {question.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizCard;
