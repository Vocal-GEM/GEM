

const IntensityMeter = ({ intensity, min = -60, max = 0 }) => {
    // Clamp intensity between min and max
    const clampedIntensity = Math.max(min, Math.min(max, intensity));

    // Calculate percentage (0 to 100)
    const percentage = ((clampedIntensity - min) / (max - min)) * 100;

    // Determine color based on intensity
    // These thresholds are examples and might need tuning
    let colorClass = 'bg-green-500';
    if (intensity > -10) {
        colorClass = 'bg-red-500'; // Too loud / clipping risk
    } else if (intensity > -20) {
        colorClass = 'bg-yellow-500'; // Loud
    } else if (intensity < -50) {
        colorClass = 'bg-slate-600'; // Silence / Noise floor
    }

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Intensity</span>
                <span>{Math.round(intensity)} dB</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10 relative">
                {/* Background markers */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/5"></div>
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/5"></div>
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/5"></div>

                {/* Meter Bar */}
                <div
                    className={`h-full transition-all duration-100 ease-out ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

export default IntensityMeter;
