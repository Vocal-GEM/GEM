const MetricCardSkeleton = () => {
    return (
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 animate-pulse flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-800 rounded-full"></div>
                <div className="h-4 w-4 bg-slate-800 rounded-full"></div>
            </div>

            {/* Main Value */}
            <div className="flex items-end gap-2">
                <div className="h-10 w-20 bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-8 bg-slate-800 rounded-lg mb-1"></div>
            </div>

            {/* Mini Chart Area */}
            <div className="h-16 w-full bg-slate-800/30 rounded-xl mt-auto"></div>
        </div>
    );
};

export default MetricCardSkeleton;
