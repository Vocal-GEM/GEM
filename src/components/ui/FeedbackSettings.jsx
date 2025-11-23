import React from 'react';
import { ClipboardCheck, Download, Flame, HeartPulse, HelpCircle, Target, Vibrate, Volume2, X } from 'lucide-react';

const FeedbackSettings = ({ settings, setSettings, isOpen, onClose, targetRange, onSetGoal, onOpenTutorial, calibration, onUpdateRange, onUpdateCalibration, onExportData }) => {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-x-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl border-t border-white/10 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[85vh] overflow-y-auto`}>
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md p-4 border-b border-white/5 flex justify-between items-center z-10">
                <h2 className="text-lg font-bold text-white">Settings</h2>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-8 pb-20">
                {/* Target Pitch Range */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Target Pitch Range</h3>
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => onSetGoal('masc')} className={`flex-1 p-3 rounded-xl border ${targetRange.min === 85 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                            <div className="font-bold text-sm">Masculine</div>
                            <div className="text-[10px] opacity-70">85-145 Hz</div>
                        </button>
                        <button onClick={() => onSetGoal('androg')} className={`flex-1 p-3 rounded-xl border ${targetRange.min === 145 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                            <div className="font-bold text-sm">Androgynous</div>
                            <div className="text-[10px] opacity-70">145-175 Hz</div>
                        </button>
                        <button onClick={() => onSetGoal('fem')} className={`flex-1 p-3 rounded-xl border ${targetRange.min === 170 ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                            <div className="font-bold text-sm">Feminine</div>
                            <div className="text-[10px] opacity-70">170-220 Hz</div>
                        </button>
                    </div>

                    {/* Manual Range Sliders */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Min Pitch</span> <span>{targetRange.min} Hz</span></div>
                            <input type="range" min="50" max="300" value={targetRange.min} onChange={(e) => onUpdateRange(parseInt(e.target.value), targetRange.max)} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Max Pitch</span> <span>{targetRange.max} Hz</span></div>
                            <input type="range" min="100" max="500" value={targetRange.max} onChange={(e) => onUpdateRange(targetRange.min, parseInt(e.target.value))} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </section>

                {/* Voice Profiles */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Voice Profiles</h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-400 mb-3">Quick switch between voice modes</div>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'fem' }))}
                                className="p-3 rounded-xl bg-pink-900/20 border border-pink-500/30 hover:bg-pink-900/40 transition-colors text-center"
                            >
                                <div className="text-pink-400 font-bold text-sm">Fem</div>
                                <div className="text-[10px] text-slate-400">170-220 Hz</div>
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'neutral' }))}
                                className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 transition-colors text-center"
                            >
                                <div className="text-purple-400 font-bold text-sm">Neutral</div>
                                <div className="text-[10px] text-slate-400">145-175 Hz</div>
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'masc' }))}
                                className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/30 hover:bg-blue-900/40 transition-colors text-center"
                            >
                                <div className="text-blue-400 font-bold text-sm">Masc</div>
                                <div className="text-[10px] text-slate-400">85-145 Hz</div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Home Note Anchor */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Home Note Anchor</h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Your baseline pitch</span>
                            <span className="text-yellow-400 font-bold">{settings.homeNote} Hz</span>
                        </div>
                        <input
                            type="range"
                            min="80"
                            max="300"
                            value={settings.homeNote}
                            onChange={(e) => setSettings({ ...settings, homeNote: parseInt(e.target.value) })}
                            className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-[10px] text-slate-500 mt-2">
                            A golden line will appear on your pitch graph at this frequency
                        </div>
                    </div>
                </section>

                {/* Biofeedback Config */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Biofeedback Triggers</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.vibration ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}><Vibrate className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Haptic Vibration</div>
                                    <div className="text-[10px] text-slate-400">Vibrate when off-target</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.vibration} onChange={(e) => setSettings({ ...settings, vibration: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.tone ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}><Volume2 className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Audio Guide Tone</div>
                                    <div className="text-[10px] text-slate-400">Play tone when off-target</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.tone} onChange={(e) => setSettings({ ...settings, tone: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                        </div>
                    </div>

                    {/* Trigger Conditions */}
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.triggerLowPitch} onChange={(e) => setSettings({ ...settings, triggerLowPitch: e.target.checked })} className="accent-blue-500 w-4 h-4 rounded" />
                            <span className="text-sm text-slate-300">Trigger when Pitch is too LOW</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={settings.triggerDarkRes} onChange={(e) => setSettings({ ...settings, triggerDarkRes: e.target.checked })} className="accent-blue-500 w-4 h-4 rounded" />
                            <span className="text-sm text-slate-300">Trigger when Resonance is too DARK</span>
                        </div>
                    </div>
                </section>

                {/* Advanced Calibration */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Advanced Calibration</h3>
                    <div className="bg-slate-800 p-4 rounded-xl space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Noise Gate Threshold</span> <span>{Math.round(settings.noiseGate * 100)}%</span></div>
                            <input type="range" min="0" max="10" step="1" value={settings.noiseGate * 100} onChange={(e) => setSettings({ ...settings, noiseGate: e.target.value / 100 })} className="w-full accent-slate-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        {calibration && (
                            <div className="pt-2 border-t border-white/5">
                                <div className="text-xs font-bold text-slate-400 mb-2">Resonance Baselines</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-slate-500">Dark (Chest)</label>
                                        <input type="number" value={Math.round(calibration.dark)} onChange={(e) => onUpdateCalibration(parseInt(e.target.value), calibration.bright)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500">Bright (Head)</label>
                                        <input type="number" value={Math.round(calibration.bright)} onChange={(e) => onUpdateCalibration(calibration.dark, parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Data Management */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Data & System</h3>
                    <div className="space-y-3">
                        <button onClick={onOpenTutorial} className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <HelpCircle className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-200">Replay Tutorial</span>
                        </button>
                        <button onClick={onExportData} className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <Download className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-200">Export My Data (JSON)</span>
                        </button>
                        <div className="text-[10px] text-slate-600 text-center pt-4">
                            Vocal GEM v0.9.2 (Beta) <br />
                            Made with ❤️ for the community
                        </div>
                    </div>
                </section>

                {/* Health & Assessment */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Health & Progress</h3>
                    <div className="space-y-3">
                        <button onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openVocalHealth')), 100); }} className="w-full p-3 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <HeartPulse className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-bold text-white">Vocal Health Tips</span>
                        </button>
                        <button onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openAssessment')), 100); }} className="w-full p-3 bg-blue-800 hover:bg-blue-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <ClipboardCheck className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-bold text-white">Baseline Assessment</span>
                        </button>
                    </div>
                </section>

                {/* Exercises & Drills */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Exercises & Drills</h3>
                    <div className="space-y-3">
                        <button onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openWarmUp')), 100); }} className="w-full p-3 bg-orange-800 hover:bg-orange-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-sm font-bold text-white">Warm-Up Exercises</span>
                        </button>
                        <button onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openForwardFocus')), 100); }} className="w-full p-3 bg-purple-800 hover:bg-purple-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                            <Target className="w-5 h-5 text-purple-400" />
                            <span className="text-sm font-bold text-white">Forward Focus Drill</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FeedbackSettings;
