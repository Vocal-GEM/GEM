
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const CalibrationSummary = ({ results, onConfirm, onRecalibrate }) => {
    const { dark, bright, noiseFloor, rms } = results;

    // Health Checks
    const isNoiseHigh = noiseFloor > -40; // dB
    const isSignalLow = rms < 0.01;
    const range = bright - dark;
    const isRangeNarrow = range < 500;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce-subtle">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>

                <h2 className="text-2xl font-bold text-white">Calibration Complete</h2>
                <p className="text-slate-400">Here&apos;s what we learned about your environment and voice.</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Resonance Range</div>
                        <div className="text-xl font-bold text-white">{Math.round(dark)} - {Math.round(bright)} Hz</div>
                        {isRangeNarrow && <div className="text-xs text-yellow-400 mt-1 flex items-center justify-center gap-1"><AlertTriangle size={10} /> Narrow Range</div>}
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Noise Floor</div>
                        <div className={`text-xl font-bold ${isNoiseHigh ? 'text-red-400' : 'text-green-400'}`}>
                            {Math.round(noiseFloor)} dB
                        </div>
                        {isNoiseHigh && <div className="text-xs text-red-400 mt-1">Too Noisy</div>}
                    </div>
                </div>

                {/* Warnings */}
                {(isNoiseHigh || isSignalLow) && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                        <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> Quality Warning
                        </h3>
                        <ul className="text-xs text-red-200 space-y-1 list-disc list-inside">
                            {isNoiseHigh && <li>Background noise is high. Try a quieter room.</li>}
                            {isSignalLow && <li>Microphone signal is weak. Move closer.</li>}
                        </ul>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onRecalibrate}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> Recalibrate
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[2] py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalibrationSummary;
