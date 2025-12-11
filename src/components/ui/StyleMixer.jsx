import { useState } from 'react';
import { Sliders } from 'lucide-react';

const StyleMixer = ({ onComplete }) => {
    const [settings, setSettings] = useState({
        pitch: 50,
        resonance: 50,
        weight: 50,
        breath: 50,
        inflection: 50
    });

    const handleChange = (key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The Mixing Board</h2>
                <p className="text-slate-400">
                    Who are you today? Design your &quot;Preset&quot;.
                    You are the Audio Engineer of your own voice.
                </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">

                {[
                    { id: 'pitch', label: 'Pitch Floor', left: 'Deep/Grounded', right: 'High/Light' },
                    { id: 'resonance', label: 'Brightness', left: 'Warm/Dark', right: 'Sharp/Bright' },
                    { id: 'weight', label: 'Vocal Weight', left: 'Soft/Airy', right: 'Assertive/Thick' },
                    { id: 'inflection', label: 'Personality', left: 'Calm/Metric', right: 'Bouncy/Expressive' }
                ].map(slider => (
                    <div key={slider.id} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-300">
                            <span>{slider.label}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings[slider.id]}
                            onChange={(e) => handleChange(slider.id, e.target.value)}
                            className="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 uppercase tracking-widest">
                            <span>{slider.left}</span>
                            <span>{slider.right}</span>
                        </div>
                    </div>
                ))}

            </div>

            <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 text-center">
                <h4 className="font-bold text-indigo-300 mb-2">Current Preset Analysis</h4>
                <p className="text-white text-lg font-serif">
                    "{settings.pitch > 70 ? 'Bubblier' : 'More Grounded'} &bull; {settings.resonance > 70 ? 'Sparkly' : 'Warmer'} &bull; {settings.inflection > 70 ? 'Very Expressive' : 'Chill'}"
                </p>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Have Designed My Voice
                </button>
            </div>
        </div>
    );
};

export default StyleMixer;
