import React from 'react';

/**
 * Skeleton - Animated loading placeholder
 */
const Skeleton = ({ className = '', variant = 'default' }) => {
    const baseClasses = 'animate-pulse bg-slate-800 rounded';

    const variants = {
        default: 'h-4 w-full',
        title: 'h-8 w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        button: 'h-10 w-24',
        card: 'h-32 w-full',
        stat: 'h-20 w-full',
        text: 'h-4 w-full',
        circle: 'h-16 w-16 rounded-full'
    };

    return (
        <div className={`${baseClasses} ${variants[variant] || variants.default} ${className}`} />
    );
};

/**
 * Card Skeleton - For dashboard cards
 */
export const CardSkeleton = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="title" className="w-1/2" />
                <Skeleton className="w-1/3" />
            </div>
        </div>
        <Skeleton className="h-24" />
    </div>
);

/**
 * List Skeleton - For lists of items
 */
export const ListSkeleton = ({ items = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl">
                <Skeleton variant="circle" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-2/3" />
                    <Skeleton className="w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

/**
 * Stats Grid Skeleton
 */
export const StatsGridSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton variant="title" className="w-1/2" />
                <Skeleton className="w-1/3" />
            </div>
        ))}
    </div>
);

/**
 * Chart Skeleton
 */
export const ChartSkeleton = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <Skeleton variant="title" className="w-1/3 mb-4" />
        <div className="h-48 flex items-end gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 bg-slate-800 rounded-t animate-pulse"
                    style={{ height: `${Math.random() * 100}%` }}
                />
            ))}
        </div>
    </div>
);

/**
 * Full Page Skeleton
 */
export const PageSkeleton = () => (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton variant="title" className="w-1/4" />
            <Skeleton variant="button" />
        </div>
        <StatsGridSkeleton />
        <CardSkeleton />
        <ListSkeleton items={3} />
    </div>
);

export default Skeleton;
