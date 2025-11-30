import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TooltipOverlay = ({
    step,
    onNext,
    onPrev,
    onSkip,
    isFirstStep,
    isLastStep,
    isActive
}) => {
    const [position, setPosition] = useState(null);
    const targetRef = useRef(null);

    useEffect(() => {
        if (!isActive || !step) return;

        const updatePosition = () => {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                setPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right
                });

                // Scroll target into view if needed
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);

        // Small delay to ensure UI has settled
        const timer = setTimeout(updatePosition, 100);

        return () => {
            window.removeEventListener('resize', updatePosition);
            clearTimeout(timer);
        };
    }, [step, isActive]);

    if (!isActive || !step || !position) return null;

    // Calculate tooltip position relative to target
    // Simple logic: prefer bottom, fallback to top if near bottom edge
    const isNearBottom = position.bottom > window.innerHeight - 200;
    const tooltipStyle = isNearBottom
        ? { bottom: window.innerHeight - position.top + 20, left: position.left + position.width / 2 }
        : { top: position.bottom + 20, left: position.left + position.width / 2 };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop with hole */}
            <div className="absolute inset-0 bg-slate-950/80 clip-path-hole" style={{
                clipPath: `polygon(
                    0% 0%, 
                    0% 100%, 
                    100% 100%, 
                    100% 0%, 
                    0% 0%, 
                    ${position.left}px ${position.top}px, 
                    ${position.right}px ${position.top}px, 
                    ${position.right}px ${position.bottom}px, 
                    ${position.left}px ${position.bottom}px, 
                    ${position.left}px ${position.top}px
                )`
            }}></div>

            {/* Highlight Border */}
            <div
                className="absolute border-2 border-teal-500 rounded-lg animate-pulse shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                style={{
                    top: position.top - 4,
                    left: position.left - 4,
                    width: position.width + 8,
                    height: position.height + 8,
                }}
            />

            {/* Tooltip Card */}
            <div
                className="absolute pointer-events-auto w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-300"
                style={{
                    ...tooltipStyle,
                    transform: 'translateX(-50%)'
                }}
            >
                <button
                    onClick={onSkip}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{step.content}</p>

                <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        {!isFirstStep && (
                            <button
                                onClick={onPrev}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onNext}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
                    >
                        {isLastStep ? 'Finish' : 'Next'} <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TooltipOverlay;
