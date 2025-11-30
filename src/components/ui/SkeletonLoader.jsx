import React from 'react';

const SkeletonLoader = ({ className = "", variant = "text", count = 1 }) => {
    const items = Array.from({ length: count });

    const getClasses = () => {
        switch (variant) {
            case 'circle':
                return 'rounded-full';
            case 'rect':
                return 'rounded-xl';
            case 'text':
            default:
                return 'rounded-md h-4';
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((_, i) => (
                <div
                    key={i}
                    className={`bg-slate-800/50 animate-pulse ${getClasses()}`}
                    style={{
                        animationDelay: `${i * 100}ms`,
                        width: variant === 'text' && i === items.length - 1 && items.length > 1 ? '70%' : '100%'
                    }}
                />
            ))}
        </div>
    );
};

export default SkeletonLoader;
