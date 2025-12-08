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

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const tooltipWidth = 320; // w-80 = 20rem = 320px
                const padding = 16; // Screen edge padding

                // 1. Determine Placement
                let placement = step.placement || 'bottom';

                // On mobile (< 768px), force top/bottom to avoid horizontal overflow from side tooltips
                if (viewportWidth < 768 && (placement === 'left' || placement === 'right')) {
                    placement = 'bottom';
                }

                // 2. Calculate ideal coordinates (unclamped)
                let top = 0;
                let left = 0;
                const gap = 12;

                // Helper to calculate coords based on placement
                const getCoords = (p) => {
                    if (p === 'top') return { t: rect.top - gap, l: rect.left + rect.width / 2 };
                    if (p === 'bottom') return { t: rect.bottom + gap, l: rect.left + rect.width / 2 };
                    if (p === 'left') return { t: rect.top + rect.height / 2, l: rect.left - gap };
                    if (p === 'right') return { t: rect.top + rect.height / 2, l: rect.right + gap };
                    return { t: rect.bottom + gap, l: rect.left + rect.width / 2 };
                };

                let coords = getCoords(placement);
                top = coords.t;
                left = coords.l;

                // 3. Flip if out of bounds (Vertical)
                // If top placement goes off screen top, flip to bottom
                if (placement === 'top' && top < 100) {
                    placement = 'bottom';
                    coords = getCoords(placement);
                    top = coords.t;
                    left = coords.l;
                }
                // If bottom placement goes off screen bottom, flip to top
                else if (placement === 'bottom' && top > viewportHeight - 150) {
                    placement = 'top';
                    coords = getCoords(placement);
                    top = coords.t;
                    left = coords.l;
                }

                // 4. Clamp Horizontal Position (Critical for Mobile)
                // We want the tooltip center (left) to be such that the tooltip body (width 320) is in view.
                // Tooltip left edge = left - 160. Right edge = left + 160.
                const halfWidth = tooltipWidth / 2;
                const minLeft = halfWidth + padding;
                const maxLeft = viewportWidth - halfWidth - padding;

                const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));

                // Calculate arrow offset (how much we shifted from the ideal target center)
                // Positive means we shifted tooltip left, so arrow needs to shift right (positive) relative to tooltip center
                const arrowOffset = left - clampedLeft;

                setPosition({
                    top,
                    left: clampedLeft,
                    placement,
                    arrowOffset
                });
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

            {/* Global Skip Button (Safety Hatch) */}
            <button
                onClick={skipTour}
                className="absolute top-4 right-4 z-[10000] px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 text-sm font-medium transition-all pointer-events-auto"
            >
                Skip Tour
            </button>

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
                className={`absolute w-80 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300 ease-in-out flex flex-col gap-3 animate-in fade-in zoom-in-95 border border-slate-700`}
                style={{
                    top: position.top,
                    left: position.left,
                    transform: `translate(${position.placement === 'left' || position.placement === 'right' ? (position.placement === 'left' ? '-100%, -50%' : '0, -50%') : '-50%, ' + (position.placement === 'top' ? '-100%' : '0')})`
                }}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-white">{step.title}</h3>
                    <button onClick={skipTour} className="text-slate-400 hover:text-slate-200 p-1">
                        <X size={16} />
                    </button>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{step.content}</p>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-700">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Step {currentStep + 1} of {tourConfig.length}
                    </span>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 text-sm font-bold transition-colors"
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
                    className={`absolute w-4 h-4 bg-slate-900 border-slate-700 transform rotate-45 ${position.placement === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2 border-b border-r' :
                        position.placement === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2 border-t border-l' :
                            position.placement === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2 border-t border-r' :
                                'left-[-8px] top-1/2 -translate-y-1/2 border-b border-l'
                        }`}
                    style={{
                        marginLeft: position.placement === 'top' || position.placement === 'bottom' ? position.arrowOffset : 0,
                        marginTop: position.placement === 'left' || position.placement === 'right' ? 0 : 0 // Could add vertical clamping later
                    }}
                />
            </div>
        </div>,
        document.body
    );
};

export default TourOverlay;
