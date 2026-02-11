import { useEffect, useState, useId, useRef } from 'react';
import { Info, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';

// Clinical reference ranges for voice metrics
const CLINICAL_RANGES = {
    f1: {
        dark: { min: 300, max: 500, label: 'Dark' },
        neutral: { min: 500, max: 650, label: 'Neutral' },
        bright: { min: 650, max: 900, label: 'Bright' }
    },
    f1Normalized: {
        dark: { min: 300, max: 450, label: 'Dark' },
        neutral: { min: 450, max: 550, label: 'Neutral' },
        bright: { min: 550, max: 800, label: 'Bright' }
    },
    resonanceRatio: {
        dark: { min: 2.0, max: 3.5, label: 'Dark' },
        neutral: { min: 3.0, max: 4.5, label: 'Neutral' },
        bright: { min: 3.5, max: 6.0, label: 'Bright' }
    },
    jitter: {
        normal: { min: 0, max: 1.0, label: 'Normal' },
        mild: { min: 1.0, max: 2.0, label: 'Mild' },
        elevated: { min: 2.0, max: 5.0, label: 'Elevated' }
    },
    shimmer: {
        normal: { min: 0, max: 3.0, label: 'Normal' },
        mild: { min: 3.0, max: 6.0, label: 'Mild' },
        elevated: { min: 6.0, max: 15.0, label: 'Elevated' }
    },
    hnr: {
        poor: { min: 0, max: 10, label: 'Poor' },
        fair: { min: 10, max: 20, label: 'Fair' },
        good: { min: 20, max: 40, label: 'Good' }
    }
};

const ResonanceMetrics = ({ dataRef, showAdvanced: propShowAdvanced }) => {
    const { settings, updateSettings } = useSettings();
    const [showAdvanced, setShowAdvanced] = useState(propShowAdvanced ?? settings?.showAdvancedMetrics ?? false);
    const [metrics, setMetrics] = useState({
        f1: 0,
        f2: 0,
        centroid: 0,
        resonanceScore: 0,
        // Advanced metrics
        f1Normalized: 0,
        resonanceRatio: 0,
        pitch: 0,
        jitter: 0,
        shimmer: 0,
        hnr: 0,
        weight: 50,
        confidence: 0,
        vowel: ''
    });
    const [showTooltip, setShowTooltip] = useState(null);
    const requestRef = useRef();
    const lastUpdateRef = useRef(0);
    const componentId = useId();

    // Persist advanced toggle to settings
    const toggleAdvanced = () => {
        const newValue = !showAdvanced;
        setShowAdvanced(newValue);
        if (updateSettings) {
            updateSettings({ showAdvancedMetrics: newValue });
        }
    };

    useEffect(() => {
        const updateMetrics = () => {
            const now = performance.now();

            // Throttle updates to ~15fps (every ~66ms) to reduce React render cycles
            // Text metrics don't need to update at 60fps
            if (now - lastUpdateRef.current >= 66) {
                if (dataRef.current) {
                    lastUpdateRef.current = now;
                    const data = dataRef.current;
                    setMetrics({
                        // Basic metrics
                        f1: data.f1 ? Math.round(data.f1) : 0,
                        f2: data.f2 ? Math.round(data.f2) : 0,
                        centroid: Math.round(data.resonance || 0),
                        resonanceScore: Math.round(data.resonanceScore || 0),
                        // Advanced metrics
                        f1Normalized: data.f1Normalized ? Math.round(data.f1Normalized) : 0,
                        resonanceRatio: data.resonanceRatio ? data.resonanceRatio.toFixed(2) : '0.00',
                        pitch: data.pitch > 0 ? Math.round(data.pitch) : 0,
                        jitter: data.jitter ? data.jitter.toFixed(2) : '0.00',
                        shimmer: data.shimmer ? data.shimmer.toFixed(2) : '0.00',
                        hnr: data.hnr ? data.hnr.toFixed(1) : '0.0',
                        weight: data.weight ? Math.round(data.weight) : 50,
                        confidence: data.resonanceConfidence ? Math.round(data.resonanceConfidence * 100) : 0,
                        vowel: data.vowel || ''
                    });
                }
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            `resonance-metrics-${componentId}`,
            updateMetrics,
            renderCoordinator.PRIORITY.LOW
        );

        return () => unsubscribe();
    }, [dataRef, componentId]);

    // Get clinical range label for a metric value
    const getRangeLabel = (metricName, value) => {
        const ranges = CLINICAL_RANGES[metricName];
        if (!ranges || !value) return null;

        for (const [key, range] of Object.entries(ranges)) {
            if (value >= range.min && value <= range.max) {
                return { label: range.label, key };
            }
        }
        return null;
    };

    // Get color based on range
    const getRangeColor = (rangeKey) => {
        const colors = {
            dark: 'text-blue-400',
            neutral: 'text-slate-400',
            bright: 'text-amber-400',
            normal: 'text-emerald-400',
            fair: 'text-yellow-400',
            mild: 'text-yellow-400',
            good: 'text-emerald-400',
            poor: 'text-red-400',
            elevated: 'text-red-400'
        };
        return colors[rangeKey] || 'text-slate-400';
    };

    const MetricCard = ({ label, value, unit, color, tooltip, id, rangeMetric, compact = false }) => {
        const rangeInfo = rangeMetric ? getRangeLabel(rangeMetric, parseFloat(value)) : null;

        return (
            <div
                className={`bg-slate-800/50 rounded-xl ${compact ? 'p-3' : 'p-4'} border border-white/5 relative group`}
                role="group"
                aria-labelledby={`metric-label-${id}`}
            >
                <div className="flex justify-between items-start mb-1">
                    <span id={`metric-label-${id}`} className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-slate-400 uppercase tracking-wider`}>{label}</span>
                    <button
                        className="text-slate-600 hover:text-slate-300 transition-colors"
                        onMouseEnter={() => setShowTooltip(id)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onFocus={() => setShowTooltip(id)}
                        onBlur={() => setShowTooltip(null)}
                        aria-label={`Information about ${label}`}
                        aria-describedby={showTooltip === id ? `tooltip-${id}` : undefined}
                    >
                        <Info size={compact ? 12 : 14} aria-hidden="true" />
                    </button>
                </div>
                <div
                    className={`${compact ? 'text-lg' : 'text-2xl'} font-bold ${rangeInfo ? getRangeColor(rangeInfo.key) : color}`}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <span aria-label={`${label}: ${value} ${unit}`}>{value}</span>
                    <span className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 font-normal`} aria-hidden="true"> {unit}</span>
                </div>
                {rangeInfo && (
                    <div className={`${compact ? 'text-[9px]' : 'text-[10px]'} mt-1 ${getRangeColor(rangeInfo.key)} opacity-80`}>
                        {rangeInfo.label}
                    </div>
                )}

                {showTooltip === id && (
                    <div
                        id={`tooltip-${id}`}
                        role="tooltip"
                        className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-900/95 backdrop-blur border border-white/10 rounded-lg z-50 text-xs text-slate-300 shadow-xl"
                    >
                        {tooltip}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div role="region" aria-label="Resonance metrics display">
            {/* Basic Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <MetricCard
                    id="f1"
                    label="R1 (F1)"
                    value={metrics.f1}
                    unit="Hz"
                    color="text-emerald-400"
                    rangeMetric="f1"
                    tooltip="First Formant (R1). Associated with throat space. Higher = Brighter/Feminine, Lower = Darker/Masculine. Clinical range: Dark 300-500 Hz, Neutral 500-650 Hz, Bright 650-900 Hz."
                />
                <MetricCard
                    id="f2"
                    label="R2 (F2)"
                    value={metrics.f2}
                    unit="Hz"
                    color="text-teal-400"
                    tooltip="Second Formant (R2). Associated with mouth space and tongue position. Higher = Brighter."
                />
                <MetricCard
                    id="centroid"
                    label="Brightness"
                    value={metrics.centroid}
                    unit="Hz"
                    color="text-cyan-400"
                    tooltip="Spectral Centroid. The 'center of gravity' of your sound spectrum. Higher values mean a brighter sound."
                />
                <MetricCard
                    id="score"
                    label="RBI Score"
                    value={metrics.resonanceScore}
                    unit="%"
                    color="text-purple-400"
                    tooltip="Resonance Brightness Index (RBI). A composite score (0-100) indicating how bright and forward your resonance is. Target varies by profile: Bright (65-100), Balanced (35-65), or Dark (0-35)."
                />
            </div>

            {/* Advanced Metrics Toggle */}
            <button
                onClick={toggleAdvanced}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 bg-slate-800/30 hover:bg-slate-800/50 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-all text-xs font-medium"
                aria-expanded={showAdvanced}
                aria-controls="advanced-metrics-panel"
            >
                <Activity size={14} />
                <span>Clinical Metrics</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Advanced Metrics Panel */}
            {showAdvanced && (
                <div
                    id="advanced-metrics-panel"
                    className="bg-slate-900/50 rounded-xl p-4 border border-white/5 mb-4"
                >
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity size={12} />
                        Clinical Voice Metrics
                    </div>

                    {/* Pitch-Normalized Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <MetricCard
                            id="f1norm"
                            label="F1 Normalized"
                            value={metrics.f1Normalized}
                            unit="Hz"
                            color="text-emerald-400"
                            rangeMetric="f1Normalized"
                            compact
                            tooltip="Pitch-normalized F1. Removes the natural pitch-F1 correlation for fair comparison across different pitches. Based on Titze (1989) research."
                        />
                        <MetricCard
                            id="ratio"
                            label="F1/F0 Ratio"
                            value={metrics.resonanceRatio}
                            unit=""
                            color="text-amber-400"
                            rangeMetric="resonanceRatio"
                            compact
                            tooltip="F1 divided by pitch (F0). Vowel-independent resonance metric. Dark: 2.0-3.5, Neutral: 3.0-4.5, Bright: 3.5-6.0."
                        />
                        <MetricCard
                            id="pitch"
                            label="Pitch (F0)"
                            value={metrics.pitch}
                            unit="Hz"
                            color="text-blue-400"
                            compact
                            tooltip="Fundamental frequency of your voice. Typical ranges: Masculine 85-155 Hz, Androgynous 145-185 Hz, Feminine 165-255 Hz."
                        />
                    </div>

                    {/* Voice Quality Metrics */}
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                        Voice Quality
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <MetricCard
                            id="jitter"
                            label="Jitter"
                            value={metrics.jitter}
                            unit="%"
                            color="text-slate-300"
                            rangeMetric="jitter"
                            compact
                            tooltip="Pitch perturbation (cycle-to-cycle variation). Normal: <1%, Mild: 1-2%, Elevated: >2%. Higher values may indicate vocal fatigue or pathology."
                        />
                        <MetricCard
                            id="shimmer"
                            label="Shimmer"
                            value={metrics.shimmer}
                            unit="%"
                            color="text-slate-300"
                            rangeMetric="shimmer"
                            compact
                            tooltip="Amplitude perturbation. Normal: <3%, Mild: 3-6%, Elevated: >6%. Higher values may indicate breathiness or vocal instability."
                        />
                        <MetricCard
                            id="hnr"
                            label="HNR"
                            value={metrics.hnr}
                            unit="dB"
                            color="text-slate-300"
                            rangeMetric="hnr"
                            compact
                            tooltip="Harmonic-to-Noise Ratio. Measures voice clarity. Poor: <10 dB, Fair: 10-20 dB, Good: >20 dB. Higher = clearer voice."
                        />
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard
                            id="weight"
                            label="Weight"
                            value={metrics.weight}
                            unit="%"
                            color="text-orange-400"
                            compact
                            tooltip="Spectral weight/tilt. Lower values = lighter/breathier voice, Higher values = heavier/pressed voice. 50% is balanced."
                        />
                        <MetricCard
                            id="confidence"
                            label="Confidence"
                            value={metrics.confidence}
                            unit="%"
                            color="text-green-400"
                            compact
                            tooltip="Measurement confidence. Higher = more reliable readings. Below 50% suggests noisy signal or unclear voice."
                        />
                        <MetricCard
                            id="vowel"
                            label="Vowel"
                            value={metrics.vowel || '—'}
                            unit=""
                            color="text-pink-400"
                            compact
                            tooltip="Detected vowel based on F1/F2 formant analysis. Uses IPA vowel symbols."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResonanceMetrics;
