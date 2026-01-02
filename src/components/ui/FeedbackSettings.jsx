import { useState, useEffect } from 'react';
import { X, Mic2, Vibrate, Volume2, Eye, Target, Activity, Wifi, WifiOff, RefreshCw, Trash2, HelpCircle, Download, HeartPulse, ClipboardCheck, Flame, Book, Upload, FileText, Database, Brain } from 'lucide-react';
import { textToSpeechService } from '../../services/TextToSpeechService';
import { syncManager, STORES } from '../../services/SyncManager';
import MicrophoneCalibration from './MicrophoneCalibration';
import InfoTooltip from './InfoTooltip';
import VoiceDataConsent from './VoiceDataConsent';

const FeedbackSettings = ({ settings, setSettings, isOpen, onClose, onOpenTutorial, calibration, onUpdateCalibration, filterSettings, onUpdateFilters, onExportData, audioEngine, user }) => {
    const [availableVoices, setAvailableVoices] = useState([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const [knowledgeBaseData, setKnowledgeBaseData] = useState(null);
    const [showDirectory, setShowDirectory] = useState(false);
    const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
    const [showVoiceDataConsent, setShowVoiceDataConsent] = useState(false);

    useEffect(() => {
        if (settings.ttsProvider === 'elevenlabs') {
            setIsLoadingVoices(true);
            textToSpeechService.getElevenLabsVoices()
                .then(voices => {
                    setAvailableVoices(voices);
                    setIsLoadingVoices(false);
                });
        }
    }, [settings.ttsProvider]);

    const [error, setError] = useState(null);

    const fetchKnowledgeBase = async () => {
        setIsLoadingDirectory(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';
            const response = await fetch(`${API_URL}/api/knowledge-base/list`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setKnowledgeBaseData(data);
            } else {
                console.error('Failed to fetch knowledge base');
                setError('Failed to load documents. Backend might be offline.');
            }
        } catch (error) {
            console.error('Error fetching knowledge base:', error);
            setError('Network error. Check your connection.');
        } finally {
            setIsLoadingDirectory(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Determine API URL (use Render URL for easier local dev without running local backend)
            const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';

            const response = await fetch(`${API_URL}/api/train`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                // Don't set Content-Type header, let browser set it with boundary for FormData
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus({ type: 'success', message: data.message || 'File uploaded and processed successfully!' });
                // Refresh directory after successful upload
                if (showDirectory) {
                    fetchKnowledgeBase();
                }
            } else {
                setUploadStatus({ type: 'error', message: data.error || 'Upload failed.' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus({ type: 'error', message: 'Network error. Is the backend running?' });
        } finally {
            setIsUploading(false);
            // Clear input
            event.target.value = null;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`fixed inset-x-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl border-t border-white/10 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[85vh] overflow-y-auto`}>
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md p-4 border-b border-white/5 flex justify-between items-center z-10">
                    <h2 className="text-lg font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-8 pb-20">




                    {/* Voice Profiles */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Voice Profiles</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-slate-400 mb-3">Quick switch between voice modes</div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'fem' }))}
                                    className="p-4 rounded-xl bg-pink-900/20 border border-pink-500/30 hover:bg-pink-900/40 transition-colors text-center"
                                >
                                    <div className="text-pink-400 font-bold text-sm">Fem</div>
                                    <div className="text-[10px] text-slate-400">170-220 Hz</div>
                                </button>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'neutral' }))}
                                    className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 transition-colors text-center"
                                >
                                    <div className="text-purple-400 font-bold text-sm">Neutral</div>
                                    <div className="text-[10px] text-slate-400">135-175 Hz</div>
                                </button>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('switchProfile', { detail: 'masc' }))}
                                    className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 hover:bg-blue-900/40 transition-colors text-center"
                                >
                                    <div className="text-blue-400 font-bold text-sm">Masc</div>
                                    <div className="text-[10px] text-slate-400">85-135 Hz</div>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Gender Feedback Settings */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender Feedback Labels</h3>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="text-xs text-slate-400 mb-2">
                                Customize how pitch ranges are labeled to match your comfort level.
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setSettings({ ...settings, genderFeedbackMode: 'neutral' })}
                                    className={`p-3 rounded-lg text-xs font-bold transition-colors ${(settings.genderFeedbackMode || 'neutral') === 'neutral'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                        }`}
                                >
                                    Neutral
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, genderFeedbackMode: 'default' })}
                                    className={`p-3 rounded-lg text-xs font-bold transition-colors ${settings.genderFeedbackMode === 'default'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                        }`}
                                >
                                    Gendered
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, genderFeedbackMode: 'off' })}
                                    className={`p-3 rounded-lg text-xs font-bold transition-colors ${settings.genderFeedbackMode === 'off'
                                        ? 'bg-slate-500 text-white'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                        }`}
                                >
                                    Hidden
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">
                                &quot;Neutral&quot; uses terms like &quot;High/Low Range&quot; instead of &quot;Feminine/Masculine&quot;.
                            </p>
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
                                className="w-full accent-yellow-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-[10px] text-slate-500 mt-2">
                                A golden line will appear on your pitch graph at this frequency
                            </div>
                        </div>
                    </section>

                    {/* Voice Settings */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Coach Voice</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.ttsProvider === 'elevenlabs' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Mic2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">High Quality Voice</div>
                                        <div className="text-[10px] text-slate-400">Use ElevenLabs AI (Requires API Key)</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.ttsProvider === 'elevenlabs'}
                                        onChange={(e) => setSettings({ ...settings, ttsProvider: e.target.checked ? 'elevenlabs' : 'browser' })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>

                            {settings.ttsProvider === 'elevenlabs' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                        <div className="text-xs text-blue-200">
                                            ℹ️ ElevenLabs API key is configured on the server. If voices don&apos;t load, contact your administrator.
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Voice Model</label>
                                        <select
                                            value={settings.voiceId || ''}
                                            onChange={(e) => setSettings({ ...settings, voiceId: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors appearance-none"
                                            disabled={isLoadingVoices}
                                        >
                                            {isLoadingVoices ? (
                                                <option>Loading voices...</option>
                                            ) : availableVoices.length > 0 ? (
                                                availableVoices.map(voice => (
                                                    <option key={voice.voice_id} value={voice.voice_id}>{voice.name}</option>
                                                ))
                                            ) : (
                                                <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Default)</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Real-Time Feedback Config */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Real-Time Feedback</h3>

                        {/* Sensitivity Slider */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 mb-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                                <span className="font-bold text-white">Feedback Sensitivity</span>
                                <span className="text-blue-400 font-mono">{(settings.feedback?.sensitivity || 0.5) * 100}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.feedback?.sensitivity || 0.5}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    feedback: { ...settings.feedback, sensitivity: parseFloat(e.target.value) }
                                })}
                                className="w-full accent-blue-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                                <span>Strict (High Precision)</span>
                                <span>Lenient (Beginner)</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Haptic Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${(settings.feedback?.hapticEnabled ?? settings.vibration) ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Vibrate className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Haptic Vibration</div>
                                        <div className="text-[10px] text-slate-400">Vibrate patterns on phone/laptop</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.feedback?.hapticEnabled ?? settings.vibration}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            vibration: e.target.checked,
                                            feedback: { ...settings.feedback, hapticEnabled: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            {/* Audio Mode */}
                            <div className="p-3 bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${(settings.feedback?.audioMode || 'tones') !== 'off' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Volume2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Audio Feedback Style</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {['tones', 'verbal', 'chimes', 'off'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setSettings({
                                                ...settings,
                                                tone: mode !== 'off',
                                                feedback: { ...settings.feedback, audioMode: mode }
                                            })}
                                            className={`p-2 rounded-lg text-xs font-bold capitalize transition-colors ${(settings.feedback?.audioMode || 'tones') === mode
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Theme */}
                            <div className="p-3 bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div className="text-sm font-bold text-white">Visual Theme</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'orb', name: 'Resonance Orb', desc: 'Abstract & Organic' },
                                        { id: 'graph', name: 'Analysis Graph', desc: 'Detailed Plotting' },
                                        { id: 'arrow', name: 'Directional', desc: 'Simple Guidance' },
                                        { id: 'numeric', name: 'Data Focus', desc: 'Big Numbers' }
                                    ].map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setSettings({
                                                ...settings,
                                                feedback: { ...settings.feedback, visualTheme: theme.id }
                                            })}
                                            className={`p-3 rounded-lg text-left transition-colors border ${(settings.feedback?.visualTheme || 'orb') === theme.id
                                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                : 'bg-slate-700/50 border-transparent text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="text-xs font-bold">{theme.name}</div>
                                            <div className="text-[10px] opacity-60">{theme.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trigger Conditions */}
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-3">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Auto-Intervention Triggers</div>
                            <div className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                                <input type="checkbox" checked={settings.triggerLowPitch} onChange={(e) => setSettings({ ...settings, triggerLowPitch: e.target.checked })} className="accent-blue-500 w-5 h-5 rounded" />
                                <span className="text-sm text-slate-300">Warn when Pitch drops too low</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                                <input type="checkbox" checked={settings.triggerDarkRes} onChange={(e) => setSettings({ ...settings, triggerDarkRes: e.target.checked })} className="accent-blue-500 w-5 h-5 rounded" />
                                <span className="text-sm text-slate-300">Warn when Resonance gets too dark</span>
                            </div>
                        </div>
                    </section>

                    {/* Dashboard Configuration */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Dashboard Configuration</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">Show Streak</span>
                                <input
                                    type="checkbox"
                                    checked={settings.dashboardConfig?.showStreak ?? true}
                                    onChange={(e) => setSettings({ ...settings, dashboardConfig: { ...settings.dashboardConfig, showStreak: e.target.checked } })}
                                    className="accent-blue-500 w-5 h-5 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">Show Total Practice</span>
                                <input
                                    type="checkbox"
                                    checked={settings.dashboardConfig?.showTotalPractice ?? true}
                                    onChange={(e) => setSettings({ ...settings, dashboardConfig: { ...settings.dashboardConfig, showTotalPractice: e.target.checked } })}
                                    className="accent-blue-500 w-5 h-5 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">Show Weekly Activity</span>
                                <input
                                    type="checkbox"
                                    checked={settings.dashboardConfig?.showWeeklyActivity ?? true}
                                    onChange={(e) => setSettings({ ...settings, dashboardConfig: { ...settings.dashboardConfig, showWeeklyActivity: e.target.checked } })}
                                    className="accent-blue-500 w-5 h-5 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">Show Progress Trends</span>
                                <input
                                    type="checkbox"
                                    checked={settings.dashboardConfig?.showProgressTrends ?? true}
                                    onChange={(e) => setSettings({ ...settings, dashboardConfig: { ...settings.dashboardConfig, showProgressTrends: e.target.checked } })}
                                    className="accent-blue-500 w-5 h-5 rounded"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Accessibility */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Accessibility</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.colorBlindMode ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Color Blind Mode</div>
                                        <div className="text-[10px] text-slate-400">High contrast colors (Purple/Teal)</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.colorBlindMode || false}
                                        onChange={(e) => setSettings({ ...settings, colorBlindMode: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Voice Data & ML */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Voice Data & ML</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                                        <Brain className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">ML Gender Classification</div>
                                        <div className="text-[10px] text-slate-400">Spectral analysis for gender perception</div>
                                    </div>
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Active</span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Database className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Data Collection</div>
                                        <div className="text-[10px] text-slate-400">Help improve ML with anonymous samples</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowVoiceDataConsent(true)}
                                    className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Configure
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Appearance</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.theme === 'light' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                        {settings.theme === 'light' ? <span className="text-lg">☀️</span> : <span className="text-lg">🌙</span>}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Light Mode</div>
                                        <div className="text-[10px] text-slate-400">Switch between dark and light themes</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.theme === 'light'}
                                        onChange={(e) => setSettings({ ...settings, theme: e.target.checked ? 'light' : 'dark' })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>

                            {/* Beginner Mode */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.beginnerMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Beginner Mode</div>
                                        <div className="text-[10px] text-slate-400">Simplify UI and hide advanced metrics</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.beginnerMode || false}
                                        onChange={(e) => setSettings({ ...settings, beginnerMode: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            {/* Lite Mode (Disable 3D & Heavy Viz) */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.liteMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Lite Mode</div>
                                        <div className="text-[10px] text-slate-400">Disable 3D & heavy effects for better performance</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.liteMode || false}
                                        onChange={(e) => setSettings({ ...settings, liteMode: e.target.checked, disable3D: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </section>



                    {/* Advanced Calibration */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Advanced Calibration</h3>

                        {/* Microphone Calibration */}
                        {audioEngine && (
                            <div className="mb-4">
                                <MicrophoneCalibration audioEngine={audioEngine} />
                            </div>
                        )}

                        <div className="bg-slate-800 p-4 rounded-xl space-y-4">
                            <div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                                        <div className="flex items-center gap-1">
                                            <span>Pitch Smoothing</span>
                                            <InfoTooltip content="Reduces jitter for a cleaner line. 'High' is smoother but slightly slower." />
                                        </div>
                                        <span className="capitalize text-white font-bold">{settings.pitchSmoothing || 'medium'}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['off', 'low', 'medium', 'high'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSettings({ ...settings, pitchSmoothing: level })}
                                                className={`p-2 rounded-lg text-xs font-bold capitalize transition-colors ${(settings.pitchSmoothing || 'medium') === level
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-slate-400">Signal Validation</div>
                                        <InfoTooltip content="Prevents bad data (clipping, silence) from affecting your score." />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.signalValidation !== false}
                                            onChange={(e) => setSettings({ ...settings, signalValidation: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <div className="flex items-center gap-1">
                                        <span>Sensitivity</span>
                                        <InfoTooltip content="Adjusts how easily the app detects your voice. Lower values are more sensitive." />
                                    </div>
                                    <span>{settings.sensitivity || 50}%</span>
                                </div>
                                <input type="range" min="0" max="100" step="1" value={settings.sensitivity || 50} onChange={(e) => setSettings({ ...settings, sensitivity: parseInt(e.target.value) })} className="w-full accent-slate-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Noise Gate Threshold</span> <span>{Math.round(settings.noiseGate * 100)}%</span></div>
                                <input type="range" min="0" max="30" step="1" value={settings.noiseGate * 100} onChange={(e) => setSettings({ ...settings, noiseGate: e.target.value / 100 })} className="w-full accent-slate-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            {calibration && (
                                <div className="pt-2 border-t border-white/5">
                                    <div className="text-xs font-bold text-slate-400 mb-2">Resonance Baselines</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500">Dark (Chest)</label>
                                            <input type="number" value={Math.round(calibration.dark)} onChange={(e) => onUpdateCalibration(parseInt(e.target.value), calibration.bright)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-3 text-xs text-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500">Bright (Head)</label>
                                            <input type="number" value={Math.round(calibration.bright)} onChange={(e) => onUpdateCalibration(calibration.dark, parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-3 text-xs text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {filterSettings && (
                            <div className="pt-2 border-t border-white/5 mt-4">
                                <div className="text-xs font-bold text-slate-400 mb-2">Audio Filters</div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Highpass (Low Cut)</span>
                                            <span>{filterSettings.min} Hz</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            step="10"
                                            value={filterSettings.min}
                                            onChange={(e) => onUpdateFilters(parseInt(e.target.value), filterSettings.max)}
                                            className="w-full accent-slate-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Lowpass (High Cut)</span>
                                            <span>{filterSettings.max} Hz</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="20000"
                                            step="100"
                                            value={filterSettings.max}
                                            onChange={(e) => onUpdateFilters(filterSettings.min, parseInt(e.target.value))}
                                            className="w-full accent-slate-500 h-4 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Offline Data & Sync */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Offline Data & Sync</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${navigator.onLine ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {navigator.onLine ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{navigator.onLine ? 'Online' : 'Offline Mode'}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {navigator.onLine ? 'Ready to sync' : 'Changes saved locally'}
                                        </div>
                                    </div>
                                </div>
                                {navigator.onLine && (
                                    <button
                                        onClick={() => syncManager.forceSyncNow()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 min-h-[40px]"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Sync Now
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">Pending Items</div>
                                    <div className="text-xl font-bold text-white">{syncManager.getStatus().pendingCount}</div>
                                </div>
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase">Last Sync</div>
                                    <div className="text-xs font-bold text-white mt-1">
                                        {syncManager.getStatus().lastSyncTime ? new Date(syncManager.getStatus().lastSyncTime).toLocaleTimeString() : 'Never'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                                        await indexedDB.clear(STORES.JOURNALS);
                                        await indexedDB.clear(STORES.STATS);
                                        await indexedDB.clear(STORES.GOALS);
                                        window.location.reload();
                                    }
                                }}
                                className="w-full p-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-xl text-left flex items-center gap-3 transition-colors"
                            >
                                <Trash2 className="w-5 h-5 text-red-400" />
                                <span className="text-sm font-bold text-red-200">Clear Local Data</span>
                            </button>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Data & System</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.analyticsEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Share Anonymous Usage</div>
                                        <div className="text-[10px] text-slate-400">Help improve the app (Privacy First)</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.analyticsEnabled || false}
                                        onChange={(e) => setSettings({ ...settings, analyticsEnabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>

                            {settings.analyticsEnabled && (
                                <button onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openAnalytics')), 100); }} className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                                    <Activity className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-200">View Local Analytics</span>
                                </button>
                            )}

                            <button onClick={onOpenTutorial} className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-200">Replay Tutorial</span>
                            </button>
                            <button onClick={onExportData} className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors">
                                <Download className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-200">Export My Data (JSON)</span>
                            </button>
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
                                <span className="text-sm font-bold text-white">Forward Focus Resonance</span>
                            </button>
                        </div>
                    </section>

                    {/* Knowledge Base Upload - Admin Only */}
                    {user?.username === 'riley' && (
                        <section>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Knowledge Base (Admin)</h3>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                        <Book className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Train AI Coach</div>
                                        <div className="text-[10px] text-slate-400">Upload textbooks or articles (PDF, TXT)</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-lg p-4 border border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors text-center relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.txt,.md"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {isUploading ? (
                                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                        )}
                                        <div className="text-xs font-bold text-slate-300">
                                            {isUploading ? 'Processing...' : 'Click to Upload File'}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Max 10MB. PDF or Text files.
                                        </div>
                                    </div>
                                </div>

                                {uploadStatus && (
                                    <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${uploadStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {uploadStatus.type === 'success' ? <ClipboardCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                        {uploadStatus.message}
                                    </div>
                                )}

                                {/* Directory Viewer */}
                                <div className="border-t border-white/5 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowDirectory(!showDirectory);
                                            if (!showDirectory && !knowledgeBaseData) {
                                                fetchKnowledgeBase();
                                            }
                                        }}
                                        className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-indigo-400" />
                                            <span className="text-sm font-bold text-white">View Uploaded Documents</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{showDirectory ? '▼' : '▶'}</span>
                                    </button>

                                    {showDirectory && (
                                        <div className="mt-3 space-y-2">
                                            {isLoadingDirectory ? (
                                                <div className="text-center py-4 text-slate-400 text-xs">
                                                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                                                    Loading...
                                                </div>
                                            ) : knowledgeBaseData ? (
                                                <>
                                                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            <div>
                                                                <div className="text-slate-500 uppercase">Documents</div>
                                                                <div className="text-white font-bold">{knowledgeBaseData.total_documents}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-slate-500 uppercase">Total Size</div>
                                                                <div className="text-white font-bold">{knowledgeBaseData.total_storage_mb} MB</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-slate-500 uppercase">Storage</div>
                                                                <div className="text-white font-bold">{knowledgeBaseData.total_storage_kb} KB</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                                        {knowledgeBaseData.documents.map((doc, idx) => (
                                                            <div key={idx} className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-xs font-bold text-white truncate">{doc.source}</div>
                                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                                            {doc.chunks} chunks • {doc.size_kb} KB
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={fetchKnowledgeBase}
                                                        className="w-full p-2 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-xs font-bold text-indigo-400 flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                        Refresh
                                                    </button>
                                                </>
                                            ) : error ? (
                                                <div className="text-center py-4 text-red-400 text-xs bg-red-900/20 rounded-lg border border-red-500/20">
                                                    <div className="font-bold mb-1">Error</div>
                                                    {error}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-slate-400 text-xs">
                                                    No documents found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* About Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">About</h3>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2 text-center">
                            <div className="font-bold text-white">Vocal GEM v0.9.2 (Beta)</div>
                            <div className="text-xs text-slate-400">Designed by Riley Reso</div>
                            <div className="text-xs text-slate-400">Founded on clinical research and techniques</div>
                            <div className="text-xs text-slate-400">A hobby project made with love ❤️</div>
                            <div className="text-xs pt-2 border-t border-white/5 mt-2">
                                Contact: <a href="mailto:rreso@msudenver.edu" className="text-blue-400 hover:underline">rreso@msudenver.edu</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Voice Data Consent Modal */}
            <VoiceDataConsent
                isOpen={showVoiceDataConsent}
                onClose={() => setShowVoiceDataConsent(false)}
            />
        </>
    );
};

export default FeedbackSettings;
