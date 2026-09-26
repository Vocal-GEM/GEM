import { useState, useEffect, useId } from 'react';
import { HelpCircle } from 'lucide-react';

const InfoTooltip = ({ content, icon: Icon = HelpCircle, size = 16, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = useId();

    // Close when pressing Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible]);

    return (
        <div className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button
                type="button"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-full inline-flex items-center justify-center p-0.5"
                onClick={() => setIsVisible(!isVisible)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                aria-expanded={isVisible}
                aria-label="More information"
                aria-describedby={isVisible ? tooltipId : undefined}
            >
                <Icon size={size} className="text-slate-500 hover:text-blue-400 transition-colors" aria-hidden="true" />
            </button>

            {isVisible && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-200"
                >
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
