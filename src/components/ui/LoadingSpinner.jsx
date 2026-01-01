import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({ size = 'md', className = '', label = 'Loading...' }) => {
    // Determine size classes based on size prop
    // Default (md) is 12x12 (3rem/48px)
    let sizeClasses = 'w-12 h-12';
    if (size === 'sm') sizeClasses = 'w-6 h-6';
    if (size === 'lg') sizeClasses = 'w-16 h-16';
    if (size === 'xl') sizeClasses = 'w-24 h-24';

    // Base classes include the default min-height
    // twMerge will correctly handle overriding min-h if provided in className
    const containerClasses = twMerge(
        "flex items-center justify-center h-full min-h-[200px] w-full",
        className
    );

    return (
        <div
            className={containerClasses}
            role="status"
            aria-live="polite"
        >
            <div className={`relative ${sizeClasses}`}>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
