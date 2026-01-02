import { useState, useEffect } from 'react';
import { Mic, Globe, Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Volume2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

const HealthItem = ({ icon: Icon, label, status, message, onFix, isFixing }) => {
    const statusColors = {
        ok: 'text-green-400',
        warning: 'text-yellow-400',
        error: 'text-red-400',
        loading: 'text-slate-400'
    };

    const StatusIcon = status === 'ok' ? CheckCircle :
        status === 'error' ? XCircle :
            status === 'warning' ? AlertTriangle : Activity;

    return (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-900 ${statusColors[status]}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <div className="text-sm font-bold text-white">{label}</div>
                    <div className={`text-[10px] ${statusColors[status]}`}>{message}</div>
                </div>
            </div>
            {onFix && status !== 'ok' && (
                <button
                    onClick={onFix}
                    disabled={isFixing}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50"
                >
                    {isFixing ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Fix'}
                </button>
            )}
        </div>
    );
};

const ToolHealthCheck = () => {
    const { audioEngineRef, isAudioActive, toggleAudio } = useAudio();
    const { settings } = useSettings();
    const [checks, setChecks] = useState({
        mic: { status: 'loading', message: 'Checking...' },
        backend: { status: 'loading', message: 'Checking...' },
        audioContext: { status: 'loading', message: 'Checking...' },
        signal: { status: 'loading', message: 'Checking...' }
    });
    const [isFixing, setIsFixing] = useState(null);

    const checkBackend = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';
            const res = await fetch(`${API_URL}/`); // Root often returns 200 or 404, both mean 'connected' vs network error
            if (res.ok || res.status === 404) {
                return { status: 'ok', message: 'Connected' };
            }
            return { status: 'warning', message: `Status: ${res.status}` };
        } catch (e) {
            return { status: 'error', message: 'Unreachable' };
        }
    };

    const runChecks = async () => {
        // Audio Context
        let audioCtxStatus = 'ok';
        let audioCtxMsg = 'Running';
        if (!audioEngineRef.current) {
            audioCtxStatus = 'error';
            audioCtxMsg = 'Not Initialized';
        } else if (audioEngineRef.current.context.state === 'suspended') {
            audioCtxStatus = 'warning';
            audioCtxMsg = 'Suspended (Click to Resume)';
        }

        // Microphone
        let micStatus = 'ok';
        let micMsg = 'Access Granted';
        try {
            const permission = await navigator.permissions.query({ name: 'microphone' });
            if (permission.state === 'denied') {
                micStatus = 'error';
                micMsg = 'Permission Denied';
            } else if (permission.state === 'prompt') {
                micStatus = 'warning';
                micMsg = 'Permission Needed';
            }
        } catch (e) {
            // Firefox doesn't support generic 'microphone' permission query often
            if (!isAudioActive) {
                micStatus = 'warning';
                micMsg = 'Not Active';
            }
        }

        // Backend
        const backendResult = await checkBackend();

        // Signal (only if active)
        let signalStatus = 'ok';
        let signalMsg = 'Ready';
        if (isAudioActive && audioEngineRef.current) {
            // We can't easily peek into recent validation without hooking into the stream or dataRef
            // For now, assume OK if running, unless we add a method to AudioEngine to get last validation error
            signalMsg = 'Monitoring';
        } else {
            signalStatus = 'loading'; // Or neutral
            signalMsg = 'Inactive';
        }

        setChecks({
            mic: { status: micStatus, message: micMsg },
            backend: backendResult,
            audioContext: { status: audioCtxStatus, message: audioCtxMsg },
            signal: { status: signalStatus, message: signalMsg }
        });
    };

    useEffect(() => {
        runChecks();
        const interval = setInterval(runChecks, 5000);
        return () => clearInterval(interval);
    }, [isAudioActive]);

    const handleFixMic = async () => {
        setIsFixing('mic');
        try {
            await toggleAudio();
            // If it was off, it turns on (asking permission). If on (but maybe suspended), it restarts.
        } catch (e) {
            console.error(e);
        }
        setIsFixing(null);
        runChecks();
    };

    const handleFixContext = async () => {
        setIsFixing('audioContext');
        if (audioEngineRef.current?.context?.state === 'suspended') {
            await audioEngineRef.current.context.resume();
        }
        setIsFixing(null);
        runChecks();
    };

    return (
        <div className="bg-slate-900 rounded-2xl border border-white/10 p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Health</h3>

            <HealthItem
                icon={Mic}
                label="Microphone"
                {...checks.mic}
                onFix={checks.mic.status !== 'ok' ? handleFixMic : undefined}
                isFixing={isFixing === 'mic'}
            />

            <HealthItem
                icon={Volume2}
                label="Audio Engine"
                {...checks.audioContext}
                onFix={checks.audioContext.status !== 'ok' ? handleFixContext : undefined}
                isFixing={isFixing === 'audioContext'}
            />

            <HealthItem
                icon={Globe}
                label="Backend API"
                {...checks.backend}
                onFix={checks.backend.status !== 'ok' ? () => window.location.reload() : undefined}
            />

            <HealthItem
                icon={Activity}
                label="Signal Quality"
                {...checks.signal}
            />
        </div>
    );
};

export default ToolHealthCheck;
