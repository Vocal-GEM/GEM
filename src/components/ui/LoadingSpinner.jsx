import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const LoadingSpinner = ({
    size = 'md',
    variant = 'default',
    label = 'Loading...',
    className
}) => {
    // Size controls dimensions and border thickness
    const dimensions = {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const borderThickness = {
        xs: 'border-2',
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-8'
    };

    // Variants control colors
    const variants = {
        default: {
            track: 'border-slate-700 opacity-20',
            spin: 'border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent'
        },
        current: {
            track: 'border-current opacity-20',
            spin: 'border-t-current border-r-transparent border-b-transparent border-l-transparent'
        },
        white: {
            track: 'border-white opacity-20',
            spin: 'border-t-white border-r-transparent border-b-transparent border-l-transparent'
        }
    };

    const selectedVariant = variants[variant] || variants.default;

    // Inline sizes (xs, sm) shouldn't impose a large minimum height
    const isInline = size === 'xs' || size === 'sm';
    const containerClass = isInline ? 'inline-flex w-auto h-auto min-h-0' : 'flex w-full h-full min-h-[200px]';

    return (
        <div
            role="status"
            aria-live="polite"
            className={twMerge(clsx(
                "items-center justify-center",
                containerClass,
                className
            ))}
        >
            <div className={twMerge(clsx("relative rounded-full", dimensions[size] || dimensions.md))}>
                {/* Track circle */}
                <div
                    className={clsx(
                        "absolute top-0 left-0 w-full h-full rounded-full",
                        selectedVariant.track,
                        borderThickness[size] || borderThickness.md
                    )}
                ></div>
                {/* Spinning segment */}
                <div
                    className={clsx(
                        "absolute top-0 left-0 w-full h-full rounded-full animate-spin",
                        selectedVariant.spin,
                        borderThickness[size] || borderThickness.md
                    )}
                ></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
