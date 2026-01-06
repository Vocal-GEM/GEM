import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const LoadingSpinner = ({
    label = 'Loading...',
    size = 'lg',
    className
}) => {
    const dimensions = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const borderThickness = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-8'
    };

    // For 'sm', we usually want inline or small container.
    // For other sizes, default to the original min-height, but allow override via className
    const containerClass = size === 'sm' ? 'h-auto min-h-0' : 'h-full min-h-[200px]';

    return (
        <div
            className={twMerge(clsx(
                "flex items-center justify-center w-full",
                containerClass,
                className
            ))}
            role="status"
            aria-live="polite"
        >
            <div className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}>
                <div
                    className={clsx(
                        "absolute top-0 left-0 w-full h-full rounded-full border-slate-700",
                        borderThickness[size] || borderThickness.md
                    )}
                ></div>
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
