import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({
    label = "Loading content...",
    className = "",
    size = "w-12 h-12",
    color = "border-t-blue-500"
}) => {
    // Use tailwind-merge to combine default classes with user-provided classes.
    // Default: "flex items-center justify-center h-full min-h-[200px] w-full"
    // If user provides a class that conflicts (e.g. h-10), it will override the default.
    const containerClasses = twMerge(
        "flex items-center justify-center h-full min-h-[200px] w-full",
        className
    );

    return (
        <div
            role="status"
            aria-label={label}
            className={containerClasses}
        >
            <div className={`relative ${size}`} aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
                <div className={`absolute top-0 left-0 w-full h-full border-4 ${color} border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
            </div>
            {/* Visually hidden text for screen readers that might ignore aria-label on div */}
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
