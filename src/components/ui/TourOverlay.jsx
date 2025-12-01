import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTour } from '../../context/TourContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TourOverlay = () => {
    const { activeTour, currentStep, tourConfig, nextStep, prevStep, skipTour, endTour } = useTour();
    const [position, setPosition] = useState(null);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (!activeTour || !tourConfig) return;

        const step = tourConfig[currentStep];
        const element = document.getElementById(step.target);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const updatePosition = () => {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);

                // Calculate tooltip position
                // Default spacing
                const gap = 12;
                let top = 0;
                let left = 0;

                // Simple positioning logic (can be enhanced)
                if (step.placement === 'top') {
                    top = rect.top - gap;
                    left = rect.left + rect.width / 2;
                } else if (step.placement === 'bottom') {
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2;
                } else if (step.placement === 'left') {
                    top = rect.top + rect.height / 2;
                    left = rect.left - gap;
                } else if (step.placement === 'right') {
                    top = rect.top + rect.height / 2;
                    left = rect.right + gap;
                } else {
                    // Default to bottom
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2;
                }

                setPosition({ top, left, placement: step.placement || 'bottom' });
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        } else {
            console.warn(`Tour target #${step.target} not found`);
        }
    }, [activeTour, currentStep, tourConfig]);

    if (!activeTour || !tourConfig || !position) return null;

    const step = tourConfig[currentStep];
    const isLast = currentStep === tourConfig.length - 1;

    return createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop with "hole" effect using clip-path or just simple dimming */}
            {/* For simplicity, we'll just use a dimmed background and highlight the target with a border overlay */}
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto" />

            {/* Target Highlight */}
            {targetRect && (
                <div
                    className="absolute border-2 border-blue-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className={`absolute w-80 bg-white text-slate-900 p-5 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300 ease-in-out flex flex-col gap-3 animate-in fade-in zoom-in-95`}
                style={{
                    top: position.top,
                    left: position.left,
                    transform: `translate(${position.placement === 'left' || position.placement === 'right' ? (position.placement === 'left' ? '-100%, -50%' : '0, -50%') : '-50%, ' + (position.placement === 'top' ? '-100%' : '0')})`
                }}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <button onClick={skipTour} className="text-slate-400 hover:text-slate-600 p-1">
                        <X size={16} />
                    </button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{step.content}</p>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Step {currentStep + 1} of {tourConfig.length}
                    </span>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-sm font-bold transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={isLast ? skipTour : nextStep}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1"
                        >
                            {isLast ? 'Finish' : 'Next'}
                            {!isLast && <ChevronRight size={14} />}
                        </button>
                    </div>
                </div>

                {/* Arrow */}
                <div
                    className={`absolute w-4 h-4 bg-white transform rotate-45 ${position.placement === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
                        position.placement === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2' :
                            position.placement === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
                                'left-[-8px] top-1/2 -translate-y-1/2'
                        }`}
                />
            </div>
        </div>,
        document.body
    );
};

export default TourOverlay;
