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
        lg: 'border-4', // visual choice: large doesn't necessarily need huge borders
        xl: 'border-8'
    };

    return (
        <div
            role="status"
            className={twMerge("flex items-center justify-center h-full min-h-[200px] w-full", className)}
        >
            <div className={`relative ${sizeClass}`}>
                <div className={`absolute top-0 left-0 w-full h-full ${borderClass} border-slate-700 rounded-full`}></div>
                <div className={`absolute top-0 left-0 w-full h-full ${borderClass} border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
            className={twMerge(clsx(
                "flex items-center justify-center w-full",
                // For 'sm', we usually want inline or small container.
                // For other sizes, default to the original min-height, but allow override via className
                size === 'sm' ? 'h-auto min-h-0' : 'h-full min-h-[200px]',
                className
            ))}
        >
            <div className={twMerge(clsx("relative", dimensions[size] || dimensions.md))}>
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
