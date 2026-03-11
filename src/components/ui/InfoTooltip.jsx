import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

const InfoTooltip = ({ content, icon: Icon = HelpCircle, size = 16, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;
    const buttonRef = useRef(null);
    const tooltipRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false);
                buttonRef.current?.focus();
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
        <div className={`relative inline-flex items-center ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full text-slate-500 hover:text-blue-400 cursor-pointer transition-colors"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                aria-expanded={isVisible}
                aria-describedby={isVisible ? tooltipId : undefined}
                aria-label="Show information"
            >
                <Icon size={size} aria-hidden="true" />
            </button>

            {isVisible && (
                <div
                    id={tooltipId}
                    ref={tooltipRef}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-200 pointer-events-none"
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
