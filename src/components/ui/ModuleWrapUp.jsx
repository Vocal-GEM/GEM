import { useState } from 'react';
import { PenTool, CheckSquare, MessageCircle, Heart, Send, Shield } from 'lucide-react';

const JOURNAL_PROMPTS = [
    {
        id: 'surprise',
        question: "1. What is something that surprised me about my reaction to this first week?",
        placeholder: "Was your voice more capable than you thought? Did you get emotional?"
    },
    {
        id: 'challenge',
        question: "2. What do I expect to be challenging for me about this course?",
        placeholder: "Where do these beliefs come from? (Write a letter in defense of past you if needed!)"
    },
    {
        id: 'feeling',
        question: "3. How do I want to feel at the end of this course?",
        placeholder: "Vocal pro? Euphoric? At ease?"
    },
    {
        id: 'insights',
        question: "4. What insights did I gain in Week 1?",
        placeholder: "List things you didn't know before..."
    }
];

const HOMEWORK_ITEMS = [
    { id: 'self-care', label: 'Complete Self-Care Checklist & Journal Prompts' },
    { id: 'listening', label: '5 min Listening to Voices + Journal Observations' },
    { id: 'curiosity', label: '5 min Vocal Curiosity + Journal Observations' },
    { id: 'name-design', label: 'Complete Name Drawing Exercise' }
];

const ModuleWrapUp = ({ onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [homework, setHomework] = useState({});
    const [showConfetti, setShowConfetti] = useState(false);

    const handleAnswerChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const toggleHomework = (id) => {
        setHomework(prev => ({ ...prev, [id]: !prev[id] }));
    };



    const handleComplete = () => {
        setShowConfetti(true);
        setTimeout(() => {
            onComplete?.({ answers, homework });
        }, 2000); // Wait for confetti
    };

    return (
        <div className="space-y-12 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <h3 className="text-3xl font-bold text-white mb-4">Week 1 Complete! 🎉</h3>
                <p className="text-slate-300 max-w-2xl mx-auto">
                    You&apos;ve taken the first concrete steps towards your authentic voice.
                    Be proud of yourself. It&apos;s time to reflect and set intentions for the path ahead.
                </p>
            </div>

            {/* Journal Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                        <PenTool className="text-pink-400" size={24} />
                    </div>
                    <h4 className="text-xl font-bold text-white">Reflective Journal</h4>
                </div>

                <div className="grid gap-6">
                    {JOURNAL_PROMPTS.map(prompt => (
                        <div key={prompt.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <label className="block text-slate-200 font-medium mb-3">{prompt.question}</label>
                            <textarea
                                value={answers[prompt.id] || ''}
                                onChange={(e) => handleAnswerChange(prompt.id, e.target.value)}
                                placeholder={prompt.placeholder}
                                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-colors resize-none"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Homework Checklist */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckSquare className="text-green-400" size={24} />
                    </div>
                    <h4 className="text-xl font-bold text-white">Homework Checklist</h4>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-4">
                    {HOMEWORK_ITEMS.map(item => (
                        <label key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${homework[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-500 group-hover:border-green-400'
                                }`}>
                                {homework[item.id] && <CheckSquare size={16} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={!!homework[item.id]}
                                onChange={() => toggleHomework(item.id)}
                            />
                            <span className={`text-lg ${homework[item.id] ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Support Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <h5 className="font-bold text-white flex items-center gap-2 mb-2">
                        <Shield size={18} className="text-blue-400" /> Need Support?
                    </h5>
                    <p className="text-sm text-slate-400 mb-4">
                        You are not alone. Connect with the community or get help if you&apos;re stuck.
                    </p>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white flex items-center gap-2">
                            <MessageCircle size={16} /> Discord Community
                        </button>
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white flex items-center gap-2">
                            <Send size={16} /> Email Support
                        </button>
                    </div>
                </div>
                <div className="flex-1 border-l border-slate-700 pl-6 hidden md:block">
                    <h5 className="font-bold text-white flex items-center gap-2 mb-2">
                        <Heart size={18} className="text-pink-400" /> You&apos;ve Got This
                    </h5>
                    <p className="text-sm text-slate-400 italic">
                        &quot;I have never met somebody that couldn&apos;t improve. You are not the exception.&quot;
                    </p>
                </div>
            </div>

            {/* Complete Button */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={handleComplete}
                    className={`px-12 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 ${showConfetti
                        ? 'bg-green-500 text-white scale-110'
                        : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                        }`}
                >
                    {showConfetti ? '🎉 Awesome Work! 🎉' : 'Complete Week 1'}
                </button>
            </div>
        </div>
    );
};

export default ModuleWrapUp;
