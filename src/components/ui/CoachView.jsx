import React, { useState, useRef, useEffect } from 'react';
import { useGem } from '../../context/GemContext';
import ChatMessage from './ChatMessage';

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

    const { stats, goals } = useGem();

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: messages,
                    context: { stats, goals }
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data]);
            }
        } catch (err) {
            // Mock Response Logic (Offline Mode)
            let reply = "I'm having trouble connecting to the server, but I can still help! Try asking about pitch, resonance, or vocal weight.";
            const lowerMsg = userMsg.content.toLowerCase();

            if (lowerMsg.includes('pitch')) reply = "Pitch is the perceived frequency of your voice. For a feminine voice, target 170-220Hz. For masculine, 85-145Hz. Try the 'Pitch Staircase' game to practice control!";
            else if (lowerMsg.includes('resonance') || lowerMsg.includes('bright') || lowerMsg.includes('dark')) reply = "Resonance is the 'color' of your voice. Bright resonance (head voice) sounds more feminine, while dark resonance (chest voice) sounds more masculine. Use the Resonance Orb to visualize this!";
            else if (lowerMsg.includes('weight') || lowerMsg.includes('heavy') || lowerMsg.includes('light')) reply = "Vocal weight is how 'heavy' or 'buzzy' your voice sounds. A lighter weight is often perceived as more feminine. Try to speak softly and avoid 'pushing' the sound.";
            else if (lowerMsg.includes('warmup') || lowerMsg.includes('exercise')) reply = "Try a simple siren exercise! Glide from your lowest note to your highest and back down. Keep it smooth and light.";
            else if (lowerMsg.includes('game')) reply = "Games are a great way to practice! Go to the Arcade tab to try 'Balloon Adventure' or 'Resonance River'.";

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            }, 1000);
        } finally {
            setIsChatLoading(false);
        }
    };

    const suggestions = [
        "How do I raise my pitch?",
        "What is vocal weight?",
        "Explain resonance",
        "Give me a warmup"
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-180px)] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-300 text-sm animate-pulse">
                            Thinking...
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
                    {isChatLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <i data-lucide="send" className="w-4 h-4"></i>}
                </button>
            </form>
            <div className="text-[10px] text-slate-600 text-center pb-2">
                Curriculum based on WPATH & SES-VMTW guidelines. Not medical advice.
            </div>
        </div>
    );
};

export default CoachView;
