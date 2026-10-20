import React, { useState, useEffect } from 'react';
import { Mic, Settings, Volume2, RefreshCw } from 'lucide-react';

const AudioSourceManager = ({ onSourceChange }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        checkPermissionAndEnumerate();
    }, []);

    const checkPermissionAndEnumerate = async () => {
        try {
            // Must request permission first to get labels
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionGranted(true);

            // Stop the temp stream immediately
            stream.getTracks().forEach(track => track.stop());

            enumerateDevices();

            // Listen for changes
            navigator.mediaDevices.ondevicechange = enumerateDevices;
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionGranted(false);
        }
    };

    const enumerateDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = allDevices.filter(device => device.kind === 'audioinput');
            setDevices(audioInputs);

            // Auto-select first if none selected
            if (audioInputs.length > 0 && !selectedDeviceId) {
                setSelectedDeviceId(audioInputs[0].deviceId);
                onSourceChange?.(audioInputs[0].deviceId);
            }
        } catch (err) {
            console.error("Error enumerating devices:", err);
        }
    };

    const handleDeviceChange = (e) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
        onSourceChange?.(deviceId);
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-slate-200">
                <Settings size={18} className="text-pink-500" />
                <h3 className="font-semibold">Input Source</h3>
            </div>

            {!permissionGranted ? (
                <button
                    onClick={checkPermissionAndEnumerate}
                    className="w-full py-2 bg-pink-600 rounded-lg text-white text-sm"
                >
                    Grant Microphone Access
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="relative">
                        <Mic size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <select
                            value={selectedDeviceId}
                            onChange={handleDeviceChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500 appearance-none cursor-pointer"
                        >
                            {devices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${devices.indexOf(device) + 1}`}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">▼</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <div className="flex items-center gap-1">
                            <Volume2 size={12} />
                            <span>Stereo (2ch)</span>
                        </div>
                        <button onClick={enumerateDevices} className="flex items-center gap-1 hover:text-white transition-colors">
                            <RefreshCw size={12} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioSourceManager;
