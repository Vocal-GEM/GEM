/**
 * BeginnerTip.jsx
 * 
 * Contextual tooltips for beginners with dismiss functionality.
 * Shows helpful tips based on user actions.
 */

import { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronRight } from 'lucide-react';
import BeginnerModeService from '../../services/BeginnerModeService';

const BeginnerTip = ({
    trigger,
    position = 'bottom',
    children
}) => {
    const [tip, setTip] = useState(null);
    const [visible, setVisible] = useState(false);
    const settings = BeginnerModeService.getSettings();

    useEffect(() => {
        if (!settings.enabled || !settings.showTips) return;

        const contextTip = BeginnerModeService.getTip(trigger);
        if (contextTip) {
            setTip(contextTip);
            // Delay appearance for smoother UX
            const timer = setTimeout(() => setVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [trigger, settings.enabled, settings.showTips]);

    const handleDismiss = () => {
        if (tip) {
            BeginnerModeService.dismissTip(tip.id);
        }
        setVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2'
    };

    if (!tip || !visible) return children || null;

    return (
        <div className="relative inline-block">
            {children}
            <div
                className={`absolute z-50 w-64 ${positionClasses[position]} animate-in fade-in slide-in-from-bottom-2`}
                role="tooltip"
                aria-live="polite"
            >
                <div className="p-3 bg-gradient-to-br from-blue-900/95 to-indigo-900/95 rounded-xl border border-blue-500/30 shadow-xl backdrop-blur-sm">
                    <div className="flex items-start gap-2">
                        <Lightbulb className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                        <div className="flex-1">
                            <div className="font-bold text-white text-sm mb-1">{tip.title}</div>
                            <p className="text-xs text-blue-200">{tip.message}</p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-blue-400 hover:text-white p-1"
                            aria-label="Dismiss tip"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="w-full mt-2 py-1.5 text-xs text-blue-300 hover:text-white flex items-center justify-center gap-1"
                    >
                        Got it <ChevronRight size={12} />
                    </button>
                </div>
                {/* Arrow */}
                <div className={`absolute w-3 h-3 bg-blue-900 transform rotate-45 ${position === 'bottom' ? '-top-1.5 left-4' :
                        position === 'top' ? '-bottom-1.5 left-4' :
                            position === 'left' ? '-right-1.5 top-4' : '-left-1.5 top-4'
                    }`} />
            </div>
        </div>
    );
};

// Simple inline tip for screen readers
export const AccessibleTip = ({ children, tip }) => (
    <span className="sr-only">{tip}</span>
);

// Skip link for keyboard navigation
export const SkipLink = ({ target, children }) => (
    <a
        href={`#${target}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:font-bold"
    >
        {children}
    </a>
);

// Focus trap for modals (accessibility)
export const useFocusTrap = (containerRef, isActive) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const focusableElements = containerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        containerRef.current.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => containerRef.current?.removeEventListener('keydown', handleTab);
    }, [isActive, containerRef]);
};

export default BeginnerTip;
