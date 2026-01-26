import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({
    size = 'md',
    variant = 'default',
    label = 'Loading...',
    className,
}) => {
    // Size controls dimensions
    const dimensions = {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    // Border width controls thickness
    const borderThickness = {
        xs: 'border-2',
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-8',
    };

    // Colors for the spinning segment
    const colors = {
        default: "border-t-blue-500",
        white: "border-t-white",
        current: "border-t-current",
    };

    // Colors for the background track
    const trackColors = {
        default: "border-slate-700",
        white: "border-white/30",
        current: "border-current opacity-30",
    };

    // 'sm' and 'xs' are treated as "inline/compact" mode by default
    const isSmall = size === 'sm' || size === 'xs';

    const containerClass = isSmall
        ? 'inline-flex w-auto h-auto min-h-0'
        : 'flex w-full h-full min-h-[200px]';

    return (
        <div
            className={twMerge(
                clsx(
                    "items-center justify-center",
                    containerClass,
                    className
                )
            )}
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <div
                className={twMerge(clsx("relative rounded-full", dimensions[size] || dimensions.md))}
            >
                {/* Track circle */}
                <div
                    className={twMerge(
                        clsx(
                            'absolute top-0 left-0 w-full h-full rounded-full',
                            trackColors[variant] || trackColors.default,
                            borderThickness[size] || borderThickness.md
                        )
                    )}
                ></div>
                {/* Spinning segment */}
                <div
                    className={twMerge(
                        clsx(
                            'absolute top-0 left-0 w-full h-full border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin',
                            colors[variant] || colors.default,
                            borderThickness[size] || borderThickness.md
                        )
                    )}
                ></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
