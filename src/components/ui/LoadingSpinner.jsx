import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const LoadingSpinner = ({
    size = 'md',
    label = 'Loading...',
    className
}) => {
    // Size controls dimensions
    const dimensions = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    // Border width controls thickness
    const borderThickness = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-8'
    };

    return (
        <div
            role="status"
            className={twMerge(
                "flex items-center justify-center w-full",
                // For 'sm', we usually want inline or small container.
                // For other sizes, default to the original min-height, but allow override via className
                size === 'sm' ? 'h-auto min-h-0' : 'h-full min-h-[200px]',
                className
            )}
        >
            <div className={clsx("relative", dimensions[size] || dimensions.md)}>
                {/* Track circle */}
                <div
                    className={clsx(
                        "absolute top-0 left-0 w-full h-full rounded-full border-slate-700",
                        borderThickness[size] || borderThickness.md
                    )}
                ></div>
                {/* Spinning segment */}
                <div
                    className={clsx(
                        "absolute top-0 left-0 w-full h-full border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin",
                        borderThickness[size] || borderThickness.md
                    )}
                ></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
