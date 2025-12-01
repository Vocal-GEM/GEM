import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { CoachEngine } from '../../utils/coachEngine';
import { historyService } from '../../utils/historyService';

import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';

const CoachView = () => {
    const { dataRef } = useAudio();
    const { targetRange } = useProfile();
    const { settings } = useSettings();
    const { t } = useLanguage();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('coach.initialMessage') }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [userContext, setUserContext] = useState({ name: '', pronouns: '', goals: '' });
    const [showPersonalize, setShowPersonalize] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load user context
        const loadContext = async () => {
            const savedSettings = await historyService.getSettings();
            if (savedSettings) {
                setUserContext(prev => ({ ...prev, ...savedSettings }));
            }
        };
        loadContext();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClearChat = () => {
        setMessages([{ role: 'assistant', content: t('coach.clearedMessage') }]);
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
                    replyContent += `\n\n*${t('coach.relatedTopics')}: ${response.relatedTopics.join(', ')}*`;
                }

                setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);

            } catch (err) {
                console.error(err);
                setMessages(prev => [...prev, { role: 'assistant', content: t('coach.errorProcessing') }]);
            } finally {
                setIsChatLoading(false);
            }
        }, 600);
    };

    const suggestions = [
        t('coach.suggestion1'),
        t('coach.suggestion2'),
        t('coach.suggestion3'),
        t('coach.suggestion4')
    ];

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white relative overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" role="log" aria-live="polite" aria-label="Chat History">
                {messages.length === 0 ? (
                    <EmptyState
                        icon={Sparkles}
                        title={t('coach.title')}
                        description={t('coach.description')}
                        actionLabel={t('coach.sayHello')}
                        onAction={() => setChatInput(t('coach.helloMessage'))}
                    />
                ) : (
                    messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)
                )}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-300 text-sm animate-pulse flex items-center gap-2" role="status" aria-label={t('common.loading')}>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Contextual Tip (Simulated for now, would be real-time in prod) */}
            <div className="px-4 mb-4">
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-3 flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                        <Zap size={16} aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">{t('coach.observationTitle')}</h4>
                        <p className="text-sm text-indigo-100">
                            {t('coach.observationText')}
                        </p>
                    </div>
                    <button className="ml-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors" aria-label="Go to exercise">
                        {t('coach.go')}
                    </button>
                </div>
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
                    placeholder={t('coach.askPlaceholder')}
                    className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-slate-500 h-12"
                    disabled={isChatLoading}
                    aria-label={t('coach.inputPlaceholder')}
                />
                <button type="submit" disabled={isChatLoading} className="p-4 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={t('common.send')}>
                    {isChatLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" aria-hidden="true" />}
                </button>
            </form>

            <div className="flex justify-between items-center px-4 mb-2">
                <div className="text-[10px] text-slate-600">
                    {t('coach.disclaimer')}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowPersonalize(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold py-2">
                        {t('coach.personalize')}
                    </button>
                    <button onClick={handleClearChat} className="text-xs text-slate-500 hover:text-white transition-colors py-2">
                        {t('coach.clearChat')}
                    </button>
                </div>
            </div>

            {/* Personalization Modal */}
            {showPersonalize && (
                <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="personalize-title">
                    <h3 id="personalize-title" className="text-lg font-bold text-white mb-4">{t('coach.trainTitle')}</h3>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label htmlFor="name-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{t('coach.nameLabel')}</label>
                            <input
                                id="name-input"
                                type="text"
                                value={userContext.name}
                                onChange={e => setUserContext({ ...userContext, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder={t('coach.namePlaceholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="pronouns-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{t('coach.pronounsLabel')}</label>
                            <input
                                id="pronouns-input"
                                type="text"
                                value={userContext.pronouns}
                                onChange={e => setUserContext({ ...userContext, pronouns: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder={t('coach.pronounsPlaceholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="goals-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{t('coach.goalLabel')}</label>
                            <textarea
                                id="goals-input"
                                value={userContext.goals}
                                onChange={e => setUserContext({ ...userContext, goals: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                placeholder={t('coach.goalPlaceholder')}
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
                        {t('coach.saveClose')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoachView;
