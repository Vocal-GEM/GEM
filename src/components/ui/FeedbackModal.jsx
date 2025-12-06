import React, { useState } from 'react';
import { X, Send, Bug, MessageSquare, Loader2 } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, initialType = 'feedback', errorDetails = null }) => {
    const [type, setType] = useState(initialType); // 'feedback' or 'bug'
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // console.log('Feedback submitted:', { ... });

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setMessage('');
                setEmail('');
            }, 2000);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {type === 'bug' ? <Bug className="w-5 h-5 text-red-400" /> : <MessageSquare className="w-5 h-5 text-teal-400" />}
                        {type === 'bug' ? 'Report a Bug' : 'Send Feedback'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                        <p className="text-slate-400">Your feedback has been sent successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setType('feedback')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === 'feedback' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                Feedback
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('bug')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${type === 'bug' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                Bug Report
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                {type === 'bug' ? 'Describe the issue' : 'Your thoughts'}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                placeholder={type === 'bug' ? "What happened? What did you expect to happen?" : "How can we improve Vocal GEM?"}
                                className="w-full h-32 p-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                Email (optional)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="For follow-up questions"
                                className="w-full p-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        {errorDetails && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                                Error: {errorDetails.toString()}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="w-5 h-5" /> Send Feedback</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
