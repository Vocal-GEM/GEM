import { Activity } from 'lucide-react';

const VisualizerSkeleton = () => {
    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative animate-pulse">
            {/* Header Area */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <div className="flex gap-2">
                    <div className="h-8 w-24 bg-slate-800 rounded-lg"></div>
                    <div className="h-8 w-24 bg-slate-800 rounded-lg"></div>
                </div>
                <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex items-center justify-center bg-slate-900/50">
                <div className="text-slate-700 flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 opacity-20" />
                    <div className="h-2 w-32 bg-slate-800 rounded-full"></div>
                </div>
            </div>

            {/* Stats Panel Area (Bottom) */}
            <div className="h-32 bg-slate-950/50 border-t border-white/5 p-4 grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="h-3 w-16 bg-slate-800 rounded-full"></div>
                        <div className="h-6 w-12 bg-slate-800 rounded-lg"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualizerSkeleton;
