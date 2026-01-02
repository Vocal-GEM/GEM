import React from 'react';
import { motion } from 'framer-motion';

const VASSlider = ({ label, value, onChange, min = 0, max = 100, markers = [], disabled = false }) => {
    // Calculate percentage for the value
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300 font-medium capitalize">{label}</label>
                <span className="text-pink-400 font-mono font-bold">{Math.round(value)}</span>
            </div>

            <div className="relative h-12 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>

                {/* Markers */}
                {markers.map((marker, index) => {
                    // Calculate marker position (evenly distributed for now, assuming 4 markers = 0, 33, 66, 100 roughly)
                    // Or if markers just strings, distribute them.
                    const markerPos = (index / (markers.length - 1)) * 100;
                    return (
                        <div
                            key={index}
                            className="absolute top-6 flex flex-col items-center transform -translate-x-1/2"
                            style={{ left: `${markerPos}%` }}
                        >
                            <div className="w-0.5 h-2 bg-slate-600 mb-1"></div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">{marker}</span>
                        </div>
                    );
                })}

                {/* Input slider (invisible but functional) */}
                {!disabled && (
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                    />
                )}

                {/* Thumb handle visual */}
                {!disabled && (
                    <motion.div
                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-pink-500 pointer-events-none"
                        animate={{ left: `calc(${percentage}% - 12px)` }}
                    />
                )}
            </div>
        </div>
    );
};

export default VASSlider;
