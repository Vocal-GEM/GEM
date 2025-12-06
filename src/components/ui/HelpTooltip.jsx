import React, { useState } from 'react';

/**
 * Help Tooltip Component
 * Provides contextual help for UI elements
 */
const HelpTooltip = ({ content, children, position = 'top' }) => {
    const [show, setShow] = useState(false);

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowStyles = {
        top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-800',
        left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-slate-800'
    };

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onFocus={() => setShow(true)}
                onBlur={() => setShow(false)}
                className="ml-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                aria-label="Help information"
                type="button"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            {show && (
                <div
                    className={`absolute z-50 ${positionStyles[position]} w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-sm text-slate-300 animate-in fade-in zoom-in-95 duration-200`}
                    role="tooltip"
                >
                    {content}
                    <div className={`absolute ${arrowStyles[position]}`}></div>
                </div>
            )}
        </div>
    );
};

export default HelpTooltip;
