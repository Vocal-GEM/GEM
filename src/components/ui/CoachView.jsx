import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useGem } from '../../context/GemContext';
import ChatMessage from './ChatMessage';
import { KnowledgeService } from '../../services/KnowledgeService';
import { historyService } from '../../utils/historyService';
import { CoachEngine } from '../../utils/coachEngine';

const CoachView = () => {
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Coach GEM. Ask me anything about your voice journey!" }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const { stats, goals, journals } = useGem();

    const handleClearChat = () => {
        setMessages([{ role: 'assistant', content: "Chat cleared. What's on your mind?" }]);
    };

    const [showPersonalize, setShowPersonalize] = useState(false);
    const [userContext, setUserContext] = useState({
        name: '',
        pronouns: '',
        goals: ''
    });

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        // Simulate network delay for realism
        setTimeout(async () => {
            try {
                let reply = '';
                const lowerInput = userMsg.content.toLowerCase();

                // 1. Check for Personal Progress Questions
                if (lowerInput.includes('progress') || lowerInput.includes('stats') || lowerInput.includes('how am i doing') || lowerInput.includes('my pitch') || lowerInput.includes('my resonance')) {
                    try {
                        // Fetch latest session
                        const sessions = await historyService.getAllSessions();
                        if (sessions && sessions.length > 0) {
                            const lastSession = sessions[0]; // Assuming sorted by date desc
                            const feedback = CoachEngine.generateFeedback({ overall: lastSession.overall }, { targetPitch: { min: 170, max: 220 }, gender: 'feminine' }); // TODO: Use real user settings

                            if (lowerInput.includes('pitch')) {
                                reply = feedback.details.pitch.message;
                            } else if (lowerInput.includes('resonance')) {
                                reply = feedback.details.resonance.message;
                            } else {
                                reply = `Based on your last session on ${new Date(lastSession.date).toLocaleDateString()}:\n\n${feedback.summary}\n\n**Focus Area:** ${feedback.focusArea.title}`;
                            }
                        } else {
                            reply = "I don't have enough data yet. Try recording a session in the Analysis tab first!";
                        }
                    } catch (err) {
                        console.error("Error fetching history:", err);
                        reply = "I couldn't access your history right now.";
                    }
                }
                // 2. Knowledge Base Search
                else {
                    const results = KnowledgeService.search(userMsg.content);
                    if (results.length > 0) {
                        const topResult = results[0];
                        reply = `**${topResult.question}**\n\n${topResult.answer}`;

                        if (results.length > 1) {
                            const related = results.slice(1, 3).map(r => r.category).filter((v, i, a) => a.indexOf(v) === i);
                            if (related.length > 0) {
                                reply += `\n\n*Related topics: ${related.join(', ')}*`;
                            }
                        }
                    } else {
                        const prefix = userContext.name ? `${userContext.name}, ` : '';
                        reply = `${prefix}I'm not sure about that yet. I'm trained on resonance, pitch, and vocal weight. Try asking: "How do I brighten my voice?" or "What is vocal weight?"`;
                    }
                }

                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            } catch (err) {
                console.error(err);
                setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error processing your request." }]);
            } finally {
                setIsChatLoading(false);
            }
        }, 600);
    };

    const suggestions = [
        "How do I raise my pitch?",
        "What is vocal weight?",
        "Explain resonance",
        "Give me a warmup"
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100dvh-180px)] flex flex-col relative">
            <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Coach</span>
                <div className="flex gap-3">
                    <button onClick={() => setShowPersonalize(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold">
                        Personalize
                    </button>
                    <button onClick={handleClearChat} className="text-xs text-slate-500 hover:text-white transition-colors">
                        Clear Chat
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-300 text-sm animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mb-4 px-2">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setChatInput(s)}
                            className="text-xs glass-panel hover:bg-white/10 text-blue-300 px-3 py-1.5 rounded-full transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleChatSubmit} className="glass-panel p-2 rounded-full flex items-center gap-2 shadow-xl shrink-0 mx-2 mb-2">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your voice..."
                    className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-slate-500"
                    disabled={isChatLoading}
                />
                <button type="submit" disabled={isChatLoading} className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                    {isChatLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                </button>
            </form>
            <div className="text-[10px] text-slate-600 text-center pb-2">
                Curriculum based on WPATH & SES-VMTW guidelines. Not medical advice.
            </div>

            {/* Personalization Modal */}
            {showPersonalize && (
                <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200">
                    <h3 className="text-lg font-bold text-white mb-4">Train Your Coach</h3>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">What should I call you?</label>
                            <input
                                type="text"
                                value={userContext.name}
                                onChange={e => setUserContext({ ...userContext, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Name"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Pronouns</label>
                            <input
                                type="text"
                                value={userContext.pronouns}
                                onChange={e => setUserContext({ ...userContext, pronouns: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. she/her, they/them"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Main Goal</label>
                            <textarea
                                value={userContext.goals}
                                onChange={e => setUserContext({ ...userContext, goals: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                placeholder="What do you want to achieve with your voice?"
                            ></textarea>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPersonalize(false)}
                        className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors mt-4"
                    >
                        Save & Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoachView;
