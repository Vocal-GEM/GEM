import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, History, BookOpen, ChevronRight, Mic, Play, Award, Zap } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { CoachEngine } from '../../utils/coachEngine';
import { KnowledgeService } from '../../services/KnowledgeService';
import { historyService } from '../../utils/historyService';
import { gamificationService } from '../../services/GamificationService';
import ChatMessage from './ChatMessage';

const CoachView = () => {
    const { dataRef } = useAudio();
    const { targetRange } = useProfile();
    const { settings } = useSettings();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI Vocal Coach. Ask me about your progress, or for tips on resonance and pitch!" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [userContext, setUserContext] = useState({ name: '', pronouns: '', goals: '' });
    const [stats, setStats] = useState({ level: { level: 1, title: 'Novice' }, xp: 0, streak: 0 });
    const [showPersonalize, setShowPersonalize] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load user context
        const loadContext = async () => {
            const savedSettings = await historyService.getSettings();
            if (savedSettings) {
                setUserContext(prev => ({ ...prev, ...savedSettings }));
            }
            // Load gamification stats
            const gameStats = await gamificationService.getStats();
            setStats(gameStats);
        };
        loadContext();

        // Subscribe to gamification updates
        const unsubscribe = gamificationService.subscribe((event) => {
            if (event.type === 'XP_GAINED' || event.type === 'LEVEL_UP' || event.type === 'STREAK_UPDATE') {
                gamificationService.getStats().then(setStats);
            }
        });
        return () => unsubscribe();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Calculate XP progress percentage
    const nextLevelXP = gamificationService.getNextLevel(stats.xp).xp;
    const currentLevelXP = stats.level.xp;
    const progressPercent = Math.min(100, Math.max(0, ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

    const handleClearChat = () => {
        setMessages([{ role: 'assistant', content: "Chat cleared. What's on your mind?" }]);
    };

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
                // Fetch latest session history for context
                const sessions = await historyService.getAllSessions();

                // Construct context object
                const context = {
                    metrics: dataRef.current, // Real-time metrics
                    history: sessions,        // Historical sessions
                    settings: {
                        targetRange: targetRange,
                        genderGoal: settings?.genderGoal,
                        calibration: settings?.calibration
                    },
                    user: userContext
                };

                // Process query through CoachEngine
                const response = CoachEngine.processUserQuery(userMsg.content, context);

                let replyContent = response.text;

                // Append related topics if available
                if (response.relatedTopics && response.relatedTopics.length > 0) {
                    replyContent += `\n\n*Related topics: ${response.relatedTopics.join(', ')}*`;
                }

                setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);

                // Award small XP for interacting with coach
                await gamificationService.awardXP(10, 'Asked Coach a question');

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
        <div className="h-full flex flex-col bg-slate-950 text-white relative overflow-hidden">
            {/* Gamification Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/20">
                        {stats.level.level}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-white">{stats.level.title}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                {stats.xp} XP
                            </span>
                        </div>
                        {/* XP Bar */}
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 uppercase font-bold">Daily Streak</span>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <Zap className="w-4 h-4 fill-orange-400" />
                            {stats.streak} Days
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
                <div className="flex flex-wrap gap-2 mb-4 px-4">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setChatInput(s)}
                            className="text-xs glass-panel hover:bg-white/10 text-blue-300 px-4 py-2.5 rounded-full transition-colors min-h-[40px]"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleChatSubmit} className="glass-panel p-2 rounded-full flex items-center gap-2 shadow-xl shrink-0 mx-4 mb-4">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your voice..."
                    className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-slate-500 h-12"
                    disabled={isChatLoading}
                />
                <button type="submit" disabled={isChatLoading} className="p-4 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20 min-w-[48px] min-h-[48px] flex items-center justify-center">
                    {isChatLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                </button>
            </form>

            <div className="flex justify-between items-center px-4 mb-2">
                <div className="text-[10px] text-slate-600">
                    Curriculum based on WPATH & SES-VMTW guidelines.
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowPersonalize(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold py-2">
                        Personalize
                    </button>
                    <button onClick={handleClearChat} className="text-xs text-slate-500 hover:text-white transition-colors py-2">
                        Clear Chat
                    </button>
                </div>
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
                        onClick={async () => {
                            await historyService.saveSettings(userContext);
                            setShowPersonalize(false);
                        }}
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
