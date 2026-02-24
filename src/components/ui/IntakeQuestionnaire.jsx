import React, { useState } from 'react';
import { ChevronRight, ArrowRight, Check } from 'lucide-react';

const IntakeQuestionnaire = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = [
        {
            id: 'goals',
            title: 'Primary Voice Goals',
            type: 'multi',
            options: [
                'Feminization',
                'Masculinization',
                'Androgyny/Neutrality',
                'Voice Rehabilitation',
                'Singing Performance',
                'Public Speaking'
            ]
        },
        {
            id: 'experience',
            title: 'Prior Experience',
            type: 'single',
            options: [
                'None - Just starting',
                'Self-taught (YouTube/Apps)',
                'Worked with a coach previously',
                'Currently working with a coach'
            ]
        },
        {
            id: 'discomfort',
            title: 'Vocal Comfort',
            type: 'single',
            options: [
                'No discomfort',
                'Occasional fatigue',
                'Frequent strain/pain',
                'Hoarseness after speaking'
            ]
        },
        {
            id: 'commitment',
            title: 'Practice Commitment',
            type: 'single',
            options: [
                '15 mins / day',
                '30 mins / day',
                '1 hour / day',
                'Flexible / Weekends only'
            ]
        }
    ];

    const handleSelect = (questionId, value, type) => {
        if (type === 'single') {
            setAnswers(prev => ({ ...prev, [questionId]: value }));
        } else {
            setAnswers(prev => {
                const current = prev[questionId] || [];
                if (current.includes(value)) {
                    return { ...prev, [questionId]: current.filter(item => item !== value) };
                } else {
                    return { ...prev, [questionId]: [...current, value] };
                }
            });
        }
    };

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(answers);
        }
    };

    const currentQ = questions[step];
    const progress = ((step + 1) / questions.length) * 100;

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">
                    <span>Step {step + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-xl animate-in slide-in-from-right-4 fade-in duration-300" key={step}>
                <h2 className="text-2xl font-bold text-white mb-6">{currentQ.title}</h2>

                <div className="space-y-3">
                    {currentQ.options.map((option) => {
                        const isSelected = currentQ.type === 'single'
                            ? answers[currentQ.id] === option
                            : (answers[currentQ.id] || []).includes(option);

                        return (
                            <button
                                key={option}
                                onClick={() => handleSelect(currentQ.id, option, currentQ.type)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                                    isSelected
                                        ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                }`}
                            >
                                <span className={`font-medium ${isSelected ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>
                                    {option}
                                </span>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!answers[currentQ.id] || (Array.isArray(answers[currentQ.id]) && answers[currentQ.id].length === 0)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {step === questions.length - 1 ? 'Finish' : 'Next'}
                        {step < questions.length - 1 && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
                Your answers help us tailor the curriculum to your specific needs.
                We&apos;ll combine this with your voice analysis.
            </p>
        </div>
    );
};

export default IntakeQuestionnaire;
