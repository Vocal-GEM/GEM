import { Mic } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const MicrophoneSelector = () => {
    const { availableDevices, selectedDeviceId, selectDevice } = useAudio();

    if (!availableDevices || availableDevices.length === 0) {
        return (
            <div className="text-sm text-slate-500 italic">
                No microphones detected or permission denied.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Mic size={16} className="text-violet-400" />
                Input Device
            </label>
            <div className="relative">
                <select
                    value={selectedDeviceId}
                    onChange={(e) => selectDevice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl p-3 appearance-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                >
                    <option value="default">System Default</option>
                    {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
                Note: Changing microphone will restart the audio engine.
            </p>
        </div>
    );
};

export default MicrophoneSelector;
