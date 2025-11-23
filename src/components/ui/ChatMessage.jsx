import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ role, content }) => {
    const isUser = role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                <div className={`text-sm leading-relaxed markdown-content ${isUser ? 'text-white' : 'text-slate-200'}`}>
                    <ReactMarkdown
                        components={{
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-blue-300" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-400 underline hover:text-blue-300" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono text-amber-300" {...props} />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
