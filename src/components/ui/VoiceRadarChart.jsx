/**
 * VoiceRadarChart
 * 
 * Multi-dimensional visualization of voice characteristics.
 * Displays normalized metrics on a radar/spider chart for intuitive
 * understanding of voice presentation across multiple dimensions.
 * 
 * Based on da Cruz Martinho et al. (2024) multi-parameter findings.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Voice Radar Chart Component
 * Shows voice characteristics across 6 dimensions
 */
const VoiceRadarChart = ({
    metrics = {},
    targetMetrics = null,
    size = 240,
    showLabels = true,
    showTarget = true,
    colorScheme = 'default',
    className = ''
}) => {
    // Default metrics if not provided
    const data = metrics.normalized || {
        pitch: 50,
        breathiness: 50,
        voiceQuality: 50,
        expressiveness: 50,
        stability: 50,
        resonance: 50
    };

    // Dimension configuration
    const dimensions = [
        { key: 'pitch', label: 'Pitch', angle: 0 },
        { key: 'breathiness', label: 'Breathiness', angle: 60 },
        { key: 'voiceQuality', label: 'Quality', angle: 120 },
        { key: 'expressiveness', label: 'Expression', angle: 180 },
        { key: 'stability', label: 'Stability', angle: 240 },
        { key: 'resonance', label: 'Resonance', angle: 300 }
    ];

    // Color schemes
    const colors = {
        default: { fill: 'rgba(139, 92, 246, 0.3)', stroke: '#8b5cf6', targetStroke: '#10b981' },
        feminine: { fill: 'rgba(236, 72, 153, 0.3)', stroke: '#ec4899', targetStroke: '#f472b6' },
        masculine: { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6', targetStroke: '#60a5fa' }
    };
    const colorConfig = colors[colorScheme] || colors.default;

    const center = size / 2;
    const radius = (size / 2) - 40;

    // Calculate point position on radar
    const getPoint = (value, angleInDegrees) => {
        const normalizedRadius = (value / 100) * radius;
        const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
        return {
            x: center + normalizedRadius * Math.cos(angleInRadians),
            y: center + normalizedRadius * Math.sin(angleInRadians)
        };
    };

    // Generate polygon path
    const getPolygonPath = (values) => {
        return dimensions.map((dim, i) => {
            const value = values[dim.key] || 0;
            const point = getPoint(value, dim.angle);
            return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        }).join(' ') + ' Z';
    };

    // Generate grid circles
    const gridCircles = useMemo(() => {
        return [20, 40, 60, 80, 100].map(percent => ({
            r: (percent / 100) * radius,
            label: percent
        }));
    }, [radius]);

    // Current metrics polygon
    const dataPath = useMemo(() => getPolygonPath(data), [data, dimensions]);

    // Target metrics polygon (if provided)
    const targetPath = useMemo(() => {
        if (!targetMetrics) return null;
        return getPolygonPath(targetMetrics);
    }, [targetMetrics, dimensions]);

    return (
        <div className={`voice-radar-chart ${className}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background */}
                <circle cx={center} cy={center} r={radius + 10} fill="rgba(30, 41, 59, 0.8)" />

                {/* Grid circles */}
                {gridCircles.map(({ r, label }) => (
                    <g key={label}>
                        <circle
                            cx={center}
                            cy={center}
                            r={r}
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="1"
                        />
                    </g>
                ))}

                {/* Grid lines (spokes) */}
                {dimensions.map((dim) => {
                    const point = getPoint(100, dim.angle);
                    return (
                        <line
                            key={dim.key}
                            x1={center}
                            y1={center}
                            x2={point.x}
                            y2={point.y}
                            stroke="rgba(148, 163, 184, 0.3)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Target polygon (if showing) */}
                {showTarget && targetPath && (
                    <path
                        d={targetPath}
                        fill="none"
                        stroke={colorConfig.targetStroke}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                    />
                )}

                {/* Data polygon */}
                <path
                    d={dataPath}
                    fill={colorConfig.fill}
                    stroke={colorConfig.stroke}
                    strokeWidth="2"
                />

                {/* Data points */}
                {dimensions.map((dim) => {
                    const value = data[dim.key] || 0;
                    const point = getPoint(value, dim.angle);
                    return (
                        <circle
                            key={`point-${dim.key}`}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={colorConfig.stroke}
                            stroke="white"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Labels */}
                {showLabels && dimensions.map((dim) => {
                    const labelPoint = getPoint(115, dim.angle);
                    const value = data[dim.key] || 0;
                    return (
                        <g key={`label-${dim.key}`}>
                            <text
                                x={labelPoint.x}
                                y={labelPoint.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="rgba(226, 232, 240, 0.9)"
                                fontSize="11"
                                fontWeight="500"
                            >
                                {dim.label}
                            </text>
                            <text
                                x={labelPoint.x}
                                y={labelPoint.y + 14}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="rgba(148, 163, 184, 0.8)"
                                fontSize="10"
                            >
                                {Math.round(value)}%
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorConfig.stroke }}
                    />
                    <span className="text-slate-400">Current</span>
                </div>
                {showTarget && targetMetrics && (
                    <div className="flex items-center gap-1">
                        <div
                            className="w-3 h-0.5"
                            style={{
                                backgroundColor: colorConfig.targetStroke,
                                borderStyle: 'dashed'
                            }}
                        />
                        <span className="text-slate-400">Target</span>
                    </div>
                )}
            </div>
        </div>
    );
};

VoiceRadarChart.propTypes = {
    /** Metrics object with normalized values (0-100) for each dimension */
    metrics: PropTypes.shape({
        normalized: PropTypes.shape({
            pitch: PropTypes.number,
            breathiness: PropTypes.number,
            voiceQuality: PropTypes.number,
            expressiveness: PropTypes.number,
            stability: PropTypes.number,
            resonance: PropTypes.number
        })
    }),
    /** Optional target metrics to show as dashed outline */
    targetMetrics: PropTypes.object,
    /** Size of the chart in pixels */
    size: PropTypes.number,
    /** Whether to show dimension labels */
    showLabels: PropTypes.bool,
    /** Whether to show target overlay */
    showTarget: PropTypes.bool,
    /** Color scheme: 'default', 'feminine', or 'masculine' */
    colorScheme: PropTypes.oneOf(['default', 'feminine', 'masculine']),
    /** Additional CSS classes */
    className: PropTypes.string
};

export default VoiceRadarChart;
