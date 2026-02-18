import { useState, useEffect } from 'react';
import { Mic, MicOff, Settings, Volume2 } from 'lucide-react';

const AudioSourceManager = ({ onSourceChange }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        const checkPermissionAndEnumerate = async () => {
            try {
                // First check if we already have permission
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

                if (permissionStatus.state === 'granted') {
                    setPermissionGranted(true);
                    enumerateDevices();
                } else if (permissionStatus.state === 'prompt') {
                    // We'll need to ask
                }

                // Listen for changes
                permissionStatus.onchange = () => {
                    if (permissionStatus.state === 'granted') {
                        setPermissionGranted(true);
                        enumerateDevices();
                    }
                };
            } catch (e) {
                console.error("Permission check failed", e);
            }
        };

        const enumerateDevices = async () => {
            try {
                const devs = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devs.filter(d => d.kind === 'audioinput');
                setDevices(audioInputs);

                if (audioInputs.length > 0 && !selectedDevice) {
                    setSelectedDevice(audioInputs[0].deviceId);
                    if (onSourceChange) onSourceChange(audioInputs[0].deviceId);
                }
            } catch (err) {
                console.error("Error enumerating devices:", err);
            }
        };

        checkPermissionAndEnumerate();

        navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
        };
    }, [selectedDevice, onSourceChange]); // Added missing dependencies if needed, or remove checkPermissionAndEnumerate from deps list by moving it inside

    const handleRequestPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionGranted(true);
            // enumerateDevices will be triggered by the permission change or we can call it
            const devs = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devs.filter(d => d.kind === 'audioinput');
            setDevices(audioInputs);
        } catch (err) {
            console.error("Permission denied", err);
        }
    };

    const handleChange = (e) => {
        const deviceId = e.target.value;
        setSelectedDevice(deviceId);
        if (onSourceChange) onSourceChange(deviceId);
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings size={14} /> Audio Input
            </h3>

            {!permissionGranted ? (
                <button
                    onClick={handleRequestPermission}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    <Mic size={18} /> Enable Microphone
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${devices.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {devices.length > 0 ? <Mic size={20} /> : <MicOff size={20} />}
                    </div>
                    <div className="flex-1">
                        <select
                            value={selectedDevice}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            disabled={devices.length === 0}
                        >
                            {devices.length === 0 ? (
                                <option>No microphones found</option>
                            ) : (
                                devices.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Microphone ${devices.indexOf(device) + 1}`}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    {selectedDevice && (
                        <div className="flex flex-col items-center justify-center w-8">
                            <Volume2 size={16} className="text-slate-400" />
                            {/* Volume meter could go here */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioSourceManager;
