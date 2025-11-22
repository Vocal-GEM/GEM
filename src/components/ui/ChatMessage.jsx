import React from 'react';

const ChatMessage = ({ role, content }) => {
    const isUser = role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed">{content}</p>
            </div>
        </div>
    );
};

export default ChatMessage;
