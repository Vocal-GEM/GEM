import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, Mic, MicOff, Volume2, VolumeX,
    ArrowLeft, Send, RotateCcw, Clock,
    Sparkles, CheckCircle, X, User, Activity,
    Lightbulb, TrendingUp, Award, Zap, Heart, Star,
    ChevronRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationPracticeService from '../../services/ConversationPracticeService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { textToSpeechService } from '../../services/TextToSpeechService';
import { useAudio } from '../../context/AudioContext';

/**
 * Real-time Voice Metrics Panel
 * Shows pitch and resonance during speech
 */
const VoiceMetricsPanel = ({ dataRef, isActive }) => {
    const [metrics, setMetrics] = useState({ pitch: 0, resonance: 50, volume: 0 });

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            if (dataRef?.current) {
                setMetrics({
                    pitch: Math.round(dataRef.current.pitch || 0),
                    resonance: Math.round(dataRef.current.resonance || 50),
                    volume: Math.round((dataRef.current.rms || 0) * 100)
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [dataRef, isActive]);

    const getPitchColor = (pitch) => {
        if (pitch === 0) return 'text-slate-500';
        if (pitch >= 165 && pitch <= 255) return 'text-emerald-400';
        if (pitch >= 140 && pitch <= 280) return 'text-amber-400';
        return 'text-slate-400';
    };

    const getResonanceColor = (res) => {
        if (res >= 60) return 'text-emerald-400';
        if (res >= 40) return 'text-amber-400';
        return 'text-slate-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 space-y-3"
        >
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Activity size={12} className="text-violet-400" />
                Voice Monitor
                {isActive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            </div>

            {/* Pitch */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Pitch</span>
                    <span className={`font-mono font-bold ${getPitchColor(metrics.pitch)}`}>
                        {metrics.pitch > 0 ? `${metrics.pitch} Hz` : '—'}
                    </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                        animate={{ width: `${Math.min((metrics.pitch / 400) * 100, 100)}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                    <span>100</span>
                    <span className="text-emerald-500/50">Target: 165-255</span>
                    <span>400</span>
                </div>
            </div>

            {/* Resonance */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Resonance</span>
                    <span className={`font-mono font-bold ${getResonanceColor(metrics.resonance)}`}>
                        {metrics.resonance}%
                    </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                        animate={{ width: `${metrics.resonance}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>

            {/* Quick Tip */}
            {isActive && metrics.pitch > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-slate-400 bg-slate-800/50 rounded-lg p-2 flex items-start gap-1.5"
                >
                    <Lightbulb size={10} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                        {metrics.pitch < 165 ? "Try raising your pitch slightly" :
                            metrics.pitch > 255 ? "Find a comfortable lower range" :
                                metrics.resonance < 50 ? "Bring resonance forward" :
                                    "Great placement! Keep it up"}
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * Coaching Tips Component
 * Shows contextual tips based on scenario
 */
const CoachingTips = ({ turnCount }) => {
    const tips = [
        { icon: Heart, text: "Speak naturally - this is practice, not perfection!", color: 'text-pink-400' },
        { icon: TrendingUp, text: "Focus on your resonance while speaking", color: 'text-emerald-400' },
        { icon: Zap, text: "Use rising intonation for questions", color: 'text-amber-400' },
        { icon: Star, text: "Vary your pitch to sound more expressive", color: 'text-violet-400' }
    ];

    const currentTip = tips[turnCount % tips.length];
    const Icon = currentTip.icon;

    return (
        <motion.div
            key={turnCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 flex items-center gap-2"
        >
            <Icon size={14} className={currentTip.color} />
            <span className="text-xs text-slate-300">{currentTip.text}</span>
        </motion.div>
    );
};

/**
 * Conversation Message Bubble - Enhanced with voice quality badge
 */
const ConversationMessage = ({ message, character, onPlayAudio, voiceQuality }) => {
    const isAI = message.speaker === 'ai';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
        >
            {/* Avatar */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg shadow-lg
                    ${isAI
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20'}
                `}
            >
                {isAI ? character?.avatar || '🤖' : <User size={18} className="text-white" />}
            </motion.div>

            {/* Message Bubble */}
            <div className="flex flex-col gap-1">
                <div className={`
                    max-w-[320px] rounded-2xl px-4 py-3 shadow-lg
                    ${isAI
                        ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-tl-sm'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 rounded-tr-sm shadow-blue-600/20'}
                `}>
                    {isAI && (
                        <div className="text-xs text-violet-400 font-medium mb-1 flex items-center gap-1">
                            {character?.avatar}
                            <span>{character?.name || 'AI'}</span>
                        </div>
                    )}
                    <p className="text-slate-100 leading-relaxed text-sm">{message.text}</p>

                    {/* Play button for AI messages */}
                    {isAI && (
                        <button
                            onClick={() => onPlayAudio(message.text)}
                            className="mt-2 text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition-colors"
                        >
                            <Volume2 size={12} />
                            <span>Replay</span>
                        </button>
                    )}
                </div>

                {/* Voice quality badge for user messages */}
                {!isAI && voiceQuality && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 text-[10px] text-slate-400 self-end"
                    >
                        {voiceQuality.pitch > 165 && voiceQuality.pitch < 255 && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-0.5">
                                <CheckCircle size={8} /> Good pitch
                            </span>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Scenario Selection Card - Enhanced
 */
const ScenarioCard = ({ scenario, onSelect, stats }) => {
    const difficultyColors = {
        beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const categoryIcons = {
        'daily-life': '🌟',
        'social': '💬',
        'professional': '💼',
        'phone-call': '📞'
    };

    const practiceCount = stats?.scenarioCounts?.[scenario.id] || 0;

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(scenario)}
            className="w-full p-5 bg-gradient-to-br from-slate-900 to-slate-800/80 hover:from-slate-800 hover:to-slate-700/80 border border-slate-700 hover:border-violet-500/50 rounded-2xl text-left transition-all group shadow-lg hover:shadow-violet-500/10"
        >
            <div className="flex items-start gap-4">
                <div className="text-4xl transform group-hover:scale-110 transition-transform">
                    {scenario.character.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                            {scenario.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[scenario.difficulty]}`}>
                            {scenario.difficulty}
                        </span>
                        {practiceCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                {practiceCount}x practiced
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{scenario.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            ~{scenario.estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                            {categoryIcons[scenario.category] || '📝'}
                            {scenario.category.replace('-', ' ')}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {scenario.practiceGoals.map(goal => (
                            <span key={goal} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                                {goal}
                            </span>
                        ))}
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
            </div>
        </motion.button>
    );
};

/**
 * Session Summary Component - Enhanced
 */
const SessionSummary = ({ summary, voiceStats, onRestart, onNewScenario }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"
            >
                <Award size={48} className="text-white" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
            >
                Great Conversation! 🎉
            </motion.h2>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 mb-6"
            >
                You practiced with {summary.character} in the &quot;{summary.scenarioTitle}&quot; scenario
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 mb-6"
            >
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-3xl font-bold text-violet-400">{summary.totalTurns}</div>
                    <div className="text-xs text-slate-400">Exchanges</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-3xl font-bold text-emerald-400">{summary.durationMinutes || '<1'}</div>
                    <div className="text-xs text-slate-400">Minutes</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="text-3xl font-bold text-amber-400">{summary.practiceGoals.length}</div>
                    <div className="text-xs text-slate-400">Skills</div>
                </div>
            </motion.div>

            {/* Voice Stats */}
            {voiceStats && voiceStats.avgPitch > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-6"
                >
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center justify-center gap-2">
                        <Activity size={14} className="text-violet-400" />
                        Your Voice This Session
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-lg font-bold text-violet-400">{Math.round(voiceStats.avgPitch)} Hz</div>
                            <div className="text-xs text-slate-500">Avg Pitch</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-cyan-400">{Math.round(voiceStats.avgResonance)}%</div>
                            <div className="text-xs text-slate-500">Avg Resonance</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Practice goals badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-2 mb-8"
            >
                {summary.practiceGoals.map(goal => (
                    <span
                        key={goal}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 flex items-center gap-1"
                    >
                        <CheckCircle size={10} /> {goal}
                    </span>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-3 justify-center"
            >
                <button
                    onClick={onRestart}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-violet-600/20"
                >
                    <RotateCcw size={18} />
                    Try Again
                </button>
                <button
                    onClick={onNewScenario}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                >
                    New Scenario
                </button>
            </motion.div>
        </motion.div>
    );
};

/**
 * Main Conversation Practice Component - Enhanced
 */
const ConversationPractice = ({ onClose }) => {
    // State
    const [view, setView] = useState('selection');
    const [scenarios, setScenarios] = useState([]);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [character, setCharacter] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [showMetrics, setShowMetrics] = useState(true);
    const [voiceStats, setVoiceStats] = useState({ pitchSum: 0, resonanceSum: 0, samples: 0 });
    const [stats, setStats] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Get audio context for voice metrics
    const { dataRef } = useAudio();

    // Speech recognition
    const handleSpeechResult = useCallback((transcript) => {
        setInputText(prev => {
            if (prev.trim()) {
                return prev + ' ' + transcript;
            }
            return transcript;
        });
    }, []);

    const {
        start: startListening,
        stop: stopListening,
        listening: recognitionListening,
        isSupported: speechRecognitionSupported
    } = useSpeechRecognition(handleSpeechResult);

    // Load scenarios and stats on mount
    useEffect(() => {
        setScenarios(ConversationPracticeService.getScenarios());
        setStats(ConversationPracticeService.getStatistics());
    }, []);

    // Collect voice metrics while listening
    useEffect(() => {
        if (!isListening || !dataRef?.current) return;

        const interval = setInterval(() => {
            if (dataRef.current.pitch > 0) {
                setVoiceStats(prev => ({
                    pitchSum: prev.pitchSum + dataRef.current.pitch,
                    resonanceSum: prev.resonanceSum + (dataRef.current.resonance || 50),
                    samples: prev.samples + 1
                }));
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isListening, dataRef]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update listening state
    useEffect(() => {
        setIsListening(recognitionListening);
    }, [recognitionListening]);

    /**
     * Speak text using TTS
     */
    const speakText = async (text) => {
        if (!ttsEnabled) return;

        setIsSpeaking(true);
        try {
            await textToSpeechService.speak(text, {
                rate: character?.voiceSettings?.rate || 1.0,
                pitch: character?.voiceSettings?.pitch || 1.0,
                onEnd: () => setIsSpeaking(false)
            });
        } catch (e) {
            console.error('TTS error:', e);
            setIsSpeaking(false);
        }
    };

    /**
     * Start a conversation with selected scenario
     */
    const startConversation = async (scenario) => {
        const { openingLine, character: char } = ConversationPracticeService.startConversation(scenario.id);

        setCurrentScenario(scenario);
        setCharacter(char);
        setMessages(ConversationPracticeService.getHistory());
        setView('conversation');
        setInputText('');
        setTurnCount(0);
        setVoiceStats({ pitchSum: 0, resonanceSum: 0, samples: 0 });

        // Speak the opening line
        setTimeout(() => speakText(openingLine), 500);
    };

    /**
     * Send user message
     */
    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text || isProcessing) return;

        // Stop listening if active
        if (isListening) {
            stopListening();
        }

        setInputText('');
        setIsProcessing(true);
        setTurnCount(prev => prev + 1);

        try {
            const { aiResponse, isConversationEnded } = ConversationPracticeService.processInput(text);
            setMessages(ConversationPracticeService.getHistory());

            if (isConversationEnded) {
                if (aiResponse && ttsEnabled) {
                    await speakText(aiResponse);
                }
                setTimeout(() => {
                    const summary = ConversationPracticeService.endConversation();
                    setSessionSummary(summary);
                    setView('summary');
                    // Refresh stats
                    setStats(ConversationPracticeService.getStatistics());
                }, 1000);
            } else if (aiResponse) {
                await speakText(aiResponse);
            }
        } catch (e) {
            console.error('Error processing message:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Handle key press in input
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    /**
     * Toggle microphone
     */
    const toggleMicrophone = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    /**
     * End conversation early
     */
    const endConversation = () => {
        textToSpeechService.stop();
        const summary = ConversationPracticeService.endConversation();
        setSessionSummary(summary);
        setView('summary');
        setStats(ConversationPracticeService.getStatistics());
    };

    /**
     * Restart same scenario
     */
    const handleRestart = () => {
        if (currentScenario) {
            startConversation(currentScenario);
        }
    };

    /**
     * Go back to scenario selection
     */
    const handleNewScenario = () => {
        setCurrentScenario(null);
        setMessages([]);
        setSessionSummary(null);
        setView('selection');
    };

    // Compute voice stats for summary
    const computedVoiceStats = voiceStats.samples > 0 ? {
        avgPitch: voiceStats.pitchSum / voiceStats.samples,
        avgResonance: voiceStats.resonanceSum / voiceStats.samples
    } : null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {view !== 'selection' && (
                        <button
                            onClick={view === 'conversation' ? endConversation : handleNewScenario}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg border border-violet-500/20">
                            <MessageCircle className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Conversation Practice</h2>
                            {view === 'conversation' && character && (
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <span>{character.avatar}</span>
                                    Chatting with {character.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {view === 'conversation' && (
                        <>
                            <button
                                onClick={() => setShowMetrics(!showMetrics)}
                                className={`p-2 rounded-lg transition-colors ${showMetrics
                                    ? 'text-emerald-400 bg-emerald-500/20'
                                    : 'text-slate-500 bg-slate-800'
                                    }`}
                                title="Toggle voice metrics"
                            >
                                <Activity size={18} />
                            </button>
                            <button
                                onClick={() => setTtsEnabled(!ttsEnabled)}
                                className={`p-2 rounded-lg transition-colors ${ttsEnabled
                                    ? 'text-violet-400 bg-violet-500/20'
                                    : 'text-slate-500 bg-slate-800'
                                    }`}
                                title={ttsEnabled ? 'Mute AI voice' : 'Enable AI voice'}
                            >
                                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                <AnimatePresence mode="wait">
                    {/* Scenario Selection */}
                    {view === 'selection' && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full overflow-y-auto p-6 w-full"
                        >
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full text-violet-300 text-sm mb-4 border border-violet-500/20"
                                    >
                                        <Sparkles size={16} />
                                        AI Voice Practice
                                    </motion.div>
                                    <h1 className="text-2xl font-bold text-white mb-2">Choose a Scenario</h1>
                                    <p className="text-slate-400">
                                        Practice your voice in realistic AI conversations
                                    </p>

                                    {/* Stats */}
                                    {stats && stats.totalSessions > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 inline-flex items-center gap-4 text-xs text-slate-500"
                                        >
                                            <span>{stats.totalSessions} sessions completed</span>
                                            <span>•</span>
                                            <span>{stats.totalMinutes} mins practiced</span>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {scenarios.map((scenario, idx) => (
                                        <motion.div
                                            key={scenario.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <ScenarioCard
                                                scenario={scenario}
                                                onSelect={startConversation}
                                                stats={stats}
                                            />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Info note */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 flex items-start gap-3"
                                >
                                    <Info size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-slate-400">
                                        <p className="font-medium text-slate-300 mb-1">How it works</p>
                                        <p>The AI will speak to you and wait for your response. Use the microphone to speak or type your reply. Practice your voice naturally!</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Active Conversation */}
                    {view === 'conversation' && (
                        <motion.div
                            key="conversation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col flex-1"
                        >
                            <div className="flex flex-1 overflow-hidden">
                                {/* Messages Area */}
                                <div className="flex-1 flex flex-col">
                                    {/* Coaching tip */}
                                    <div className="px-4 pt-3">
                                        <AnimatePresence mode="wait">
                                            <CoachingTips turnCount={turnCount} />
                                        </AnimatePresence>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((msg) => (
                                            <ConversationMessage
                                                key={msg.id}
                                                message={msg}
                                                character={character}
                                                onPlayAudio={speakText}
                                            />
                                        ))}

                                        {/* Speaking indicator */}
                                        {isSpeaking && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20">
                                                    {character?.avatar || '🤖'}
                                                </div>
                                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                    <span className="text-xs text-slate-400 ml-2">Speaking...</span>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                                        {/* Suggested Responses */}
                                        {(() => {
                                            const suggestions = ConversationPracticeService.getSuggestedResponses();
                                            if (suggestions && suggestions.length > 0 && !inputText.trim()) {
                                                return (
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                            <Lightbulb size={12} className="text-amber-400" />
                                                            <span>Suggested responses:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {suggestions.map((suggestion, idx) => (
                                                                <motion.button
                                                                    key={idx}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                    onClick={() => setInputText(suggestion)}
                                                                    disabled={isProcessing || isSpeaking}
                                                                    className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-violet-500/50 rounded-lg transition-all disabled:opacity-50"
                                                                >
                                                                    {suggestion}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        <div className="max-w-2xl mx-auto flex gap-2">
                                            {/* Mic button */}
                                            {speechRecognitionSupported && (
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={toggleMicrophone}
                                                    disabled={isProcessing || isSpeaking}
                                                    className={`p-3 rounded-xl transition-all ${isListening
                                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title={isListening ? 'Stop listening' : 'Start voice input'}
                                                >
                                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                                </motion.button>
                                            )}

                                            {/* Text input */}
                                            <div className="flex-1 relative">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={inputText}
                                                    onChange={(e) => setInputText(e.target.value)}
                                                    onKeyDown={handleKeyPress}
                                                    placeholder={isListening ? "Listening..." : "Type your response..."}
                                                    disabled={isProcessing || isSpeaking}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 transition-all"
                                                />
                                                {isListening && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="flex gap-0.5">
                                                            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" />
                                                            <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                                                            <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Send button */}
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={sendMessage}
                                                disabled={!inputText.trim() || isProcessing || isSpeaking}
                                                className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
                                            >
                                                <Send size={20} />
                                            </motion.button>
                                        </div>

                                        {/* Hint text */}
                                        <p className="text-center text-xs text-slate-500 mt-2">
                                            {speechRecognitionSupported
                                                ? "Tap the mic to speak, or type your response"
                                                : "Type your response and press Enter"}
                                        </p>
                                    </div>
                                </div>

                                {/* Voice Metrics Sidebar */}
                                {showMetrics && (
                                    <div className="w-48 p-3 border-l border-slate-800 hidden lg:block">
                                        <VoiceMetricsPanel
                                            dataRef={dataRef}
                                            isActive={isListening}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Session Summary */}
                    {view === 'summary' && sessionSummary && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex items-center justify-center p-6 w-full"
                        >
                            <SessionSummary
                                summary={sessionSummary}
                                voiceStats={computedVoiceStats}
                                onRestart={handleRestart}
                                onNewScenario={handleNewScenario}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ConversationPractice;
