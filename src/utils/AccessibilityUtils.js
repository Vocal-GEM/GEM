/**
 * AccessibilityUtils.js
 * 
 * Accessibility utilities for screen readers and keyboard navigation.
 * Separated from BeginnerTip for fast refresh compatibility.
 */

import { useEffect } from 'react';

// Simple inline tip for screen readers
export const AccessibleTip = ({ tip }) => (
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

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
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

        container.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleTab);
    }, [isActive, containerRef]);
};
