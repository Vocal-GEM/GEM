import React from 'react';


const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/30 border border-white/5 ${className}`}>
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-400">
                    <Icon size={32} />
                </div>
            )}
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-xs mb-6 text-sm leading-relaxed">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700 hover:border-slate-600"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
