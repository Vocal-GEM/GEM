import React from 'react';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({ size = 'md', label = 'Loading...', className }) => {
    // We define size for width/height separately from border width
    const dimensions = {
        sm: 'w-4 h-4',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const borderConfig = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-4'
    };

    const sizeClass = dimensions[size] || dimensions.md;
    const borderClass = borderConfig[size] || borderConfig.md;

    return (
        <div
            className={twMerge("flex items-center justify-center h-full min-h-[200px] w-full", className)}
            role="status"
            aria-live="polite"
        >
            <div className={twMerge("relative", sizeClass)}>
                <div className={twMerge("absolute top-0 left-0 w-full h-full border-slate-700 rounded-full opacity-20", borderClass)}></div>
                <div className={twMerge("absolute top-0 left-0 w-full h-full border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin", borderClass)}></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
