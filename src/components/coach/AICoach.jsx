import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { KnowledgeService } from '../../services/KnowledgeService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AICoach = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hi! I'm your AI Voice Coach. Ask me anything about resonance, pitch, or vocal health!"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate "thinking" delay
        setTimeout(() => {
            const results = KnowledgeService.search(userMsg.text);
            let botResponse = '';

            if (results.length > 0) {
                const topResult = results[0];
                botResponse = `**${topResult.question}**\n\n${topResult.answer}`;

                // If there are other related results, mention them
                if (results.length > 1) {
                    botResponse += `\n\n*I also found info on: ${results.slice(1, 3).map(r => r.category).join(', ')}*`;
                }
            } else {
                botResponse = "I'm not sure about that yet. I'm still learning! Try asking about 'resonance', 'pitch', or 'warm-ups'.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-100">AI Coach</h3>
                    <p className="text-xs text-slate-400">Powered by Vocal GEM Knowledge Base</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                            ${msg.type === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
                        `}>
                            {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`
                            max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                            ${msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}
                        `}>
                            <ReactMarkdown
                                components={{
                                    strong: ({ node, ...props }) => <span className="font-bold text-indigo-300" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-slate-300" {...props} />
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800/50 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your voice..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AICoach;
