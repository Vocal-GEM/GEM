import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

const InfoTooltip = ({ content, icon: Icon = HelpCircle, size = 16, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
        >
            <Icon size={size} className="text-slate-500 hover:text-blue-400 cursor-pointer transition-colors" />

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-200">
                    <div className="text-xs text-slate-300 leading-relaxed">
                        {content}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};

export default InfoTooltip;
