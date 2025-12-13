import React, { useState } from 'react';
import { MessageCircle, Bug, Lightbulb, X, Send, Check } from 'lucide-react';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('suggestion');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!message.trim()) return;

        // Store feedback locally (in production, would send to server)
        const feedback = {
            id: `feedback_${Date.now()}`,
            type,
            message: message.trim(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const existing = JSON.parse(localStorage.getItem('gem_feedback') || '[]');
        existing.push(feedback);
        localStorage.setItem('gem_feedback', JSON.stringify(existing));

        setSubmitted(true);
        setTimeout(() => {
            setIsOpen(false);
            setMessage('');
            setSubmitted(false);
        }, 2000);
    };

    const feedbackTypes = [
        { id: 'bug', label: 'Bug Report', icon: <Bug size={16} />, color: 'red' },
        { id: 'suggestion', label: 'Suggestion', icon: <Lightbulb size={16} />, color: 'amber' },
        { id: 'other', label: 'Other', icon: <MessageCircle size={16} />, color: 'blue' }
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 lg:bottom-8 z-40 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all hover:scale-110"
                title="Send Feedback"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 lg:bottom-8 z-40 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="font-bold text-white">Send Feedback</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>

            {submitted ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                        <Check className="text-emerald-400" size={32} />
                    </div>
                    <h4 className="text-white font-bold mb-1">Thank you!</h4>
                    <p className="text-slate-400 text-sm">Your feedback has been saved.</p>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    {/* Type Selection */}
                    <div className="flex gap-2">
                        {feedbackTypes.map(ft => (
                            <button
                                key={ft.id}
                                onClick={() => setType(ft.id)}
                                className={`flex-1 p-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${type === ft.id
                                        ? ft.color === 'red'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : ft.color === 'amber'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}
                            >
                                {ft.icon}
                            </button>
                        ))}
                    </div>

                    {/* Message */}
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                            type === 'bug'
                                ? 'Describe the bug you encountered...'
                                : type === 'suggestion'
                                    ? 'Share your idea or suggestion...'
                                    : 'Tell us what\'s on your mind...'
                        }
                        className="w-full h-24 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none focus:border-blue-500 focus:outline-none"
                    />

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!message.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Send size={16} />
                        Send Feedback
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        Feedback is stored locally on your device.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;
