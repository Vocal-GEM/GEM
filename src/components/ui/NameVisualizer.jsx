import { useState } from 'react';
import { Image, Upload, Type, Music, ArrowRight, Save } from 'lucide-react';

const NameVisualizer = ({ onComplete }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [soundDescription, setSoundDescription] = useState('');
    const [step, setStep] = useState('upload'); // upload, reflect

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImageSrc(e.target.result);
            reader.readAsDataURL(file);
            setStep('reflect');
        }
    };

    return (
        <div className="space-y-6">
            {step === 'upload' ? (
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Image className="text-pink-400" size={40} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Design Your Name</h3>
                        <p className="text-slate-400 max-w-lg mx-auto">
                            Upload a photo of your name art (drawing, calligraphy, collage) that represents your gender/presentation.
                            Use tools like <strong>Canva</strong> or just paper and pen!
                        </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-pink-900/20 transition-all hover:scale-105">
                        <Upload size={20} />
                        Upload Art
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <p className="text-xs text-slate-500">
                        Don&apos;t have art right now? <button onClick={() => setStep('reflect')} className="text-pink-400 underline">Skip to reflection</button>
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
                    {/* Left: display art */}
                    <div className="bg-black/50 rounded-2xl border border-slate-700 p-4 flex items-center justify-center min-h-[300px]">
                        {imageSrc ? (
                            <img src={imageSrc} alt="Name Art" className="max-w-full max-h-[400px] rounded-lg shadow-2xl" />
                        ) : (
                            <div className="text-slate-600 italic">No image uploaded</div>
                        )}
                    </div>

                    {/* Right: Reflection */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Music className="text-purple-400" />
                                How does this look sound?
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Imagine the visual representation of your name was a sound.
                                Is it lacey and breathy? Bold and punchy? Floral and soft?
                            </p>

                            <textarea
                                value={soundDescription}
                                onChange={(e) => setSoundDescription(e.target.value)}
                                placeholder="Describe the sound of your name art..."
                                className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 resize-none text-lg font-serif italic"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => onComplete?.({ imageSrc, soundDescription })}
                                disabled={!soundDescription}
                                className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-900/20 flex items-center gap-2"
                            >
                                <Save size={20} /> Save & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NameVisualizer;
