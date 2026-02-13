/**
 * L1ProgressMeter
 * 
 * Visualizes voice modification progress using the VVD L1 Distance scale (0-6).
 * L1=0 represents the most feminine voice configuration, L1=6 the most masculine.
 * 
 * Based on Berkeley VVD research (2024) that maps pitch, resonance, and weight
 * to a unified progress metric.
 */


import PropTypes from 'prop-types';

/**
 * L1 Distance Progress Meter Component
 * Shows progress along the voice modification spectrum
 */
const L1ProgressMeter = ({
    currentL1 = null,
    targetL1 = 0,
    label = '',
    showLabels = true,
    size = 'medium',
    className = ''
}) => {
    // Normalize L1 to 0-100 percentage (L1 0-6 scale)
    const currentPosition = currentL1 !== null
        ? Math.max(0, Math.min(100, (currentL1 / 6) * 100))
        : null;
    const targetPosition = (targetL1 / 6) * 100;

    // Calculate progress towards goal
    const progress = currentL1 !== null
        ? Math.round((1 - Math.abs(currentL1 - targetL1) / 6) * 100)
        : 0;

    const sizeClasses = {
        small: 'h-2',
        medium: 'h-3',
        large: 'h-4'
    };

    const L1_LABELS = [
        { l1: 0, label: 'Feminine', color: '#ec4899' },
        { l1: 3, label: 'Androgynous', color: '#8b5cf6' },
        { l1: 6, label: 'Masculine', color: '#3b82f6' }
    ];

    return (
        <div className={`l1-progress-meter ${className}`}>
            {/* Header with current label */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">
                    Voice Position
                </span>
                <span className="text-sm text-slate-400">
                    {label || (currentL1 !== null ? `L1: ${currentL1.toFixed(1)}` : 'Not measured')}
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className={`relative ${sizeClasses[size]} bg-slate-700 rounded-full overflow-visible`}>
                {/* Gradient background */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6)'
                    }}
                />

                {/* Target marker */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white/80 rounded-full shadow-lg z-10"
                    style={{ left: `${targetPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                    title={`Target: L1=${targetL1}`}
                />

                {/* Current position marker */}
                {currentPosition !== null && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 z-20 transition-all duration-300"
                        style={{ left: `${currentPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                    />
                )}
            </div>

            {/* Scale labels */}
            {showLabels && (
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    {L1_LABELS.map(({ l1, label, color }) => (
                        <span
                            key={l1}
                            style={{ color: l1 === targetL1 ? color : undefined }}
                            className={l1 === targetL1 ? 'font-semibold' : ''}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Progress percentage */}
            <div className="text-center mt-3">
                <span className="text-2xl font-bold text-white">{progress}%</span>
                <span className="text-sm text-slate-400 ml-2">towards goal</span>
            </div>
        </div>
    );
};

L1ProgressMeter.propTypes = {
    /** Current L1 distance (0-6 scale) */
    currentL1: PropTypes.number,
    /** Target L1 distance (0=feminine, 3=androgynous, 6=masculine) */
    targetL1: PropTypes.number,
    /** Custom label override */
    label: PropTypes.string,
    /** Whether to show scale labels */
    showLabels: PropTypes.bool,
    /** Size variant */
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    /** Additional CSS classes */
    className: PropTypes.string
};

export default L1ProgressMeter;
