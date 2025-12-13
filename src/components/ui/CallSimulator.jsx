import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Play, Pause, RotateCcw, CheckCircle, Star } from 'lucide-react';

// Simulated phone scenarios
const SCENARIOS = [
    {
        id: 'appointment',
        title: 'Doctor Appointment',
        description: 'Call to schedule a doctor\'s appointment',
        prompts: [
            { speaker: 'receptionist', text: 'Hello, Dr. Smith\'s office. How may I help you?' },
            { speaker: 'user', text: 'Hi, I\'d like to schedule an appointment please.' },
            { speaker: 'receptionist', text: 'Of course. What day works best for you?' },
            { speaker: 'user', text: 'I\'m available next Tuesday afternoon, if that works.' },
            { speaker: 'receptionist', text: 'Let me check... Yes, we have 2:30 PM available. Would that work?' },
            { speaker: 'user', text: 'That\'s perfect. Thank you so much!' },
            { speaker: 'receptionist', text: 'Great! We\'ll see you Tuesday at 2:30. Have a nice day!' }
        ]
    },
    {
        id: 'takeout',
        title: 'Ordering Food',
        description: 'Call a restaurant to place a takeout order',
        prompts: [
            { speaker: 'worker', text: 'Thank you for calling Mario\'s Pizza, will this be for pickup or delivery?' },
            { speaker: 'user', text: 'Hi! I\'d like to place an order for pickup, please.' },
            { speaker: 'worker', text: 'Sure! What would you like to order?' },
            { speaker: 'user', text: 'I\'ll have a medium pepperoni pizza and a side of garlic bread.' },
            { speaker: 'worker', text: 'Got it. That\'ll be $18.50. Can I get a name for the order?' },
            { speaker: 'user', text: 'Yes, it\'s under the name Alex.' },
            { speaker: 'worker', text: 'Perfect, Alex. Your order will be ready in about 20 minutes!' }
        ]
    },
    {
        id: 'customer-service',
        title: 'Customer Service',
        description: 'Call customer service about a billing issue',
        prompts: [
            { speaker: 'rep', text: 'Thank you for calling TechCorp support. How can I assist you today?' },
            { speaker: 'user', text: 'Hi, I have a question about a charge on my account.' },
            { speaker: 'rep', text: 'I\'d be happy to help. Can you please verify your account number?' },
            { speaker: 'user', text: 'Sure, it\'s 1234-5678.' },
            { speaker: 'rep', text: 'Thank you. I see the charge you\'re referring to. This was for your subscription renewal.' },
            { speaker: 'user', text: 'Oh I see, I didn\'t realize it auto-renewed. Can I cancel that?' },
            { speaker: 'rep', text: 'Absolutely, I can process that cancellation for you right now.' }
        ]
    }
];

const CallSimulator = ({ onClose }) => {
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [completedPrompts, setCompletedPrompts] = useState([]);
    const [showReview, setShowReview] = useState(false);

    const synth = useRef(window.speechSynthesis);

    const startCall = () => {
        setIsCallActive(true);
        setCurrentPromptIndex(0);
        setCompletedPrompts([]);
        playCurrentPrompt();
    };

    const playCurrentPrompt = () => {
        if (!selectedScenario) return;
        const prompt = selectedScenario.prompts[currentPromptIndex];

        if (prompt.speaker !== 'user' && synth.current) {
            const utterance = new SpeechSynthesisUtterance(prompt.text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            synth.current.speak(utterance);
        }
    };

    const handleUserResponse = () => {
        setCompletedPrompts(prev => [...prev, currentPromptIndex]);

        if (currentPromptIndex < selectedScenario.prompts.length - 1) {
            const nextIndex = currentPromptIndex + 1;
            setCurrentPromptIndex(nextIndex);

            // If next is not user, auto-play
            if (selectedScenario.prompts[nextIndex].speaker !== 'user') {
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(selectedScenario.prompts[nextIndex].text);
                    utterance.rate = 0.9;
                    synth.current?.speak(utterance);
                }, 1000);
            }
        } else {
            // Call complete
            setIsCallActive(false);
            setShowReview(true);
        }
    };

    const endCall = () => {
        synth.current?.cancel();
        setIsCallActive(false);
        setSelectedScenario(null);
        setCurrentPromptIndex(0);
        setShowReview(false);
    };

    const currentPrompt = selectedScenario?.prompts[currentPromptIndex];
    const isUserTurn = currentPrompt?.speaker === 'user';

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Phone Call Simulator</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Scenario Selection */}
                {!selectedScenario && !showReview && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Choose a Scenario</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {SCENARIOS.map(scenario => (
                                <button
                                    key={scenario.id}
                                    onClick={() => setSelectedScenario(scenario)}
                                    className="p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone className="text-blue-400" size={24} />
                                        <h4 className="text-lg font-bold text-white">{scenario.title}</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm">{scenario.description}</p>
                                    <p className="text-xs text-slate-500 mt-2">{scenario.prompts.length} exchanges</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Call */}
                {selectedScenario && !showReview && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${isCallActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'
                                }`}>
                                <Phone className="text-white" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">{selectedScenario.title}</h3>
                            {isCallActive && (
                                <p className="text-emerald-400 text-sm">Call in progress...</p>
                            )}
                        </div>

                        {/* Conversation */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                            {isCallActive ? (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl ${isUserTurn
                                            ? 'bg-blue-500/20 border border-blue-500/30'
                                            : 'bg-slate-800'
                                        }`}>
                                        <div className="text-xs text-slate-400 mb-2 uppercase">
                                            {isUserTurn ? 'Your turn - say:' : currentPrompt?.speaker}
                                        </div>
                                        <p className="text-white text-lg">{currentPrompt?.text}</p>
                                    </div>

                                    {isUserTurn && (
                                        <button
                                            onClick={handleUserResponse}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            I said this - Continue
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 mb-4">Ready to practice this scenario?</p>
                                    <button
                                        onClick={startCall}
                                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
                                    >
                                        Start Call
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress */}
                        {isCallActive && (
                            <div className="flex gap-1 mb-4">
                                {selectedScenario.prompts.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex-1 h-1 rounded-full ${completedPrompts.includes(idx)
                                                ? 'bg-emerald-500'
                                                : idx === currentPromptIndex
                                                    ? 'bg-blue-500'
                                                    : 'bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* End Call Button */}
                        {isCallActive && (
                            <button
                                onClick={endCall}
                                className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <PhoneOff size={20} />
                                End Call
                            </button>
                        )}
                    </div>
                )}

                {/* Review */}
                {showReview && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-24 h-24 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <Star className="text-white" size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Call Complete!</h3>
                        <p className="text-slate-400 mb-8">Great job practicing your phone voice.</p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setShowReview(false);
                                    startCall();
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
                            >
                                <RotateCcw size={18} /> Try Again
                            </button>
                            <button
                                onClick={endCall}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
                            >
                                Choose Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallSimulator;
