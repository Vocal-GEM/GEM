import { Activity, Mic } from 'lucide-react';

const VisualizerSkeleton = ({ variant = 'default' }) => {
    // Animated wave bars for the loading effect
    const WaveBars = () => (
        <div className="flex items-end justify-center gap-1 h-16">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-slate-700 to-slate-600 rounded-full"
                    style={{
                        height: `${20 + Math.random() * 40}%`,
                        animation: `waveBar 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );

    // Circular orb skeleton for orb visualizers
    const OrbSkeleton = () => (
        <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
            <div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50"
                style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div
                className="absolute inset-8 rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/30"
                style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.5s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-8 h-8 text-slate-600 animate-pulse" />
            </div>
        </div>
    );

    // Spectrogram-style skeleton
    const SpectrogramSkeleton = () => (
        <div className="w-full h-full flex flex-col gap-0.5 p-4">
            {[...Array(16)].map((_, i) => (
                <div
                    key={i}
                    className="flex-1 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-sm"
                    style={{
                        opacity: 0.3 + (i % 4) * 0.15,
                        animation: `shimmer 2s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 relative">
            {/* CSS Animations */}
            <style>{`
                @keyframes waveBar {
                    0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
                    50% { transform: scaleY(1); opacity: 1; }
                }
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
            `}</style>

            {/* Header Area */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <div className="flex gap-2">
                    <div className="h-8 w-24 bg-slate-800/80 rounded-lg animate-pulse" />
                    <div className="h-8 w-20 bg-slate-800/60 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-800/60 rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="h-8 w-8 bg-slate-800/40 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                {variant === 'orb' ? (
                    <OrbSkeleton />
                ) : variant === 'spectrogram' ? (
                    <SpectrogramSkeleton />
                ) : (
                    <div className="text-slate-700 flex flex-col items-center gap-6">
                        <WaveBars />
                        <div className="flex flex-col items-center gap-2">
                            <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                            <div className="text-sm text-slate-500 animate-pulse">Loading visualization...</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Panel Area (Bottom) */}
            <div className="h-24 bg-slate-950/80 border-t border-white/5 p-4 grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div
                            className="h-3 bg-slate-800 rounded-full animate-pulse"
                            style={{ width: `${50 + i * 10}%`, animationDelay: `${i * 0.15}s` }}
                        />
                        <div
                            className="h-6 bg-slate-800 rounded-lg animate-pulse"
                            style={{ width: `${40 + i * 5}%`, animationDelay: `${i * 0.15 + 0.1}s` }}
                        />
                    </div>
                ))}
            </div>

            {/* Loading progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500"
                    style={{
                        width: '30%',
                        animation: 'loadingBar 1.5s ease-in-out infinite',
                    }}
                />
            </div>
            <style>{`
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </div>
    );
};

export default VisualizerSkeleton;
