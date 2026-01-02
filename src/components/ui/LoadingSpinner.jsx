import React from 'react';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({
    label = 'Loading...',
    size = 'lg',
    className
}) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const borders = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-4'
    };

    const sizeClass = sizes[size] || sizes.lg;
    const borderClass = borders[size] || borders.lg;

    return (
        <div
            role="status"
            className={twMerge("flex items-center justify-center h-full min-h-[200px] w-full", className)}
        >
            <div className={`relative ${sizeClass}`}>
                <div className={`absolute top-0 left-0 w-full h-full ${borderClass} border-slate-700 rounded-full`}></div>
                <div className={`absolute top-0 left-0 w-full h-full ${borderClass} border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
