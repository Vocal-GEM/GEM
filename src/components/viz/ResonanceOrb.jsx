import React, { useEffect, useRef, useState } from 'react';
import { Info, WifiOff } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

/**
 * ResonanceOrb - Visual feedback for voice resonance
 * 
 * Uses resonanceScore (0-1) derived from RBI (0-100):
 * - 0.0 - 0.35: Dark (masculine resonance)
 * - 0.35 - 0.65: Balanced (androgynous resonance)  
 * - 0.65 - 1.0: Bright (feminine resonance)
 * 
 * Includes debug display for calibration (toggle with showDebug prop)
 */
const ResonanceOrb = ({ dataRef, calibration, showDebug = false, size = 128, colorBlindMode = false }) => {
    const { activeProfile } = useProfile();
    const orbRef = useRef(null);
    const labelRef = useRef(null);

    // Debug state
    const [debugInfo, setDebugInfo] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

    // Smoothing ref
    const currentScore = useRef(0.5);

    // Hold timer
    const silenceTimer = useRef(0);

    // Label stability tracking
    const labelState = useRef({ current: "Listening...", candidate: "Listening...", count: 0 });

    // History for sparklines
    const historyRef = useRef([]);

    // Determine target zone based on profile
    const getTargetZone = () => {
        if (activeProfile === 'fem') return { min: 0.65, max: 1.0, label: 'Bright' };
        if (activeProfile === 'masc') return { min: 0.0, max: 0.35, label: 'Dark' };
        return { min: 0.35, max: 0.65, label: 'Balanced' };
    };
                        <div className="text-slate-400">F1:</div>
                        <div className="text-green-400 font-bold text-right">{debugInfo.f1} Hz</div>

                        <div className="text-slate-400">F2:</div>
                        <div className="text-green-400 font-bold text-right">{debugInfo.f2} Hz</div>

                        <div className="border-t border-slate-700/50 col-span-2 my-1"></div>

                        <div className="text-slate-400">UI Score:</div>
                        <div className="text-white font-bold text-right">{debugInfo.uiScore}%</div>
                    </div >

    {/* History Sparklines */ }
    < div className = "mt-4 pt-2 border-t border-slate-700/50" >
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">F1 History</div>
{ renderSparkline(debugInfo.history, 'f1', '#4ade80') }
                    </div >
                </div >
            )}
        </div >
    );
};

export default ResonanceOrb;