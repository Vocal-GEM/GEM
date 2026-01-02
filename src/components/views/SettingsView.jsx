import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Check, FileJson, Eye, Globe, TrendingUp, Heart, Edit3 } from 'lucide-react';
import { indexedDB } from '../../services/IndexedDBManager';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { COLORMAP_PRESETS } from '../../utils/colormaps';
import VoiceCalibrationWizard from '../ui/VoiceCalibrationWizard';
import { VoiceCalibrationService } from '../../services/VoiceCalibrationService';
import { SelfCareService } from '../../services/SelfCareService';
import SelfCareOnboarding from '../ui/SelfCareOnboarding';
import MicrophoneSelector from '../settings/MicrophoneSelector';
import ToolHealthCheck from '../ui/ToolHealthCheck';

const SettingsView = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isResetting, setIsResetting] = useState(false);
    const [showCalibrationWizard, setShowCalibrationWizard] = useState(false);
    const [baselineData, setBaselineData] = useState(() => VoiceCalibrationService.getBaseline());
    const [showSelfCareWizard, setShowSelfCareWizard] = useState(false);
    const [selfCarePlan, setSelfCarePlan] = useState(() => SelfCareService.getSelfCarePlan());

    const handleClearBaseline = () => {
        VoiceCalibrationService.clearBaseline();
        setBaselineData(null);
        setStatus({ type: 'success', message: 'Voice baseline cleared.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const handleCalibrationComplete = (metrics) => {
        setBaselineData(metrics);
        setShowCalibrationWizard(false);
        setStatus({ type: 'success', message: 'Voice baseline saved!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const handleSelfCareComplete = (plan) => {
        setSelfCarePlan(plan);
        setShowSelfCareWizard(false);
        setStatus({ type: 'success', message: 'Self-care plan updated!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const handleExport = async () => {
        try {
            setStatus({ type: 'loading', message: 'Preparing backup...' });
            const data = await indexedDB.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `gem_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setStatus({ type: 'error', message: 'Failed to export data.' });
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('WARNING: This will overwrite your current data with the backup. Are you sure?')) {
            event.target.value = ''; // Reset input
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Restoring data...' });
            const text = await file.text();
            const data = JSON.parse(text);

            await indexedDB.importData(data);

            setStatus({ type: 'success', message: 'Data restored successfully! Reloading...' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Import failed:', error);
            setStatus({ type: 'error', message: 'Failed to restore data. Invalid file format.' });
        }
        event.target.value = ''; // Reset input
    };

    const handleReset = async () => {
        if (isResetting) {
            try {
                await indexedDB.factoryReset();
                window.location.reload();
            } catch (error) {
                console.error('Reset failed:', error);
                setStatus({ type: 'error', message: 'Factory reset failed.' });
            }
        } else {
            setIsResetting(true);
            setTimeout(() => setIsResetting(false), 3000); // Reset timeout
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 p-6 lg:p-12 text-white">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

                {/* Status Message */}
                {status.message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {status.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                        <span>{status.message}</span>
                    </div>
                )}

                {/* Voice Calibration Wizard Modal */}
                {showCalibrationWizard && (
                    <VoiceCalibrationWizard
                        onComplete={handleCalibrationComplete}
                        onClose={() => setShowCalibrationWizard(false)}
                    />
                )}

                {/* Self-Care Wizard Modal */}
                {showSelfCareWizard && (
                    <SelfCareOnboarding
                        onComplete={handleSelfCareComplete}
                        onSkip={() => setShowSelfCareWizard(false)}
                    />
                )}

                {/* System Status */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-emerald-400" size={24} />
                            System Status
                        </h2>
                        <p className="text-slate-400 mt-1">Check the health of your audio and connection.</p>
                    </div>
                    <div className="p-6">
                        <ToolHealthCheck />
                    </div>
                </div>

                {/* Audio Input Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="text-violet-400">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </div>
                            Audio Input
                        </h2>
                        <p className="text-slate-400 mt-1">Select your microphone device.</p>
                    </div>
                    <div className="p-6">
                        <MicrophoneSelector />
                    </div>
                </div>

                {/* Self-Care Plan Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Heart className="text-pink-400" size={24} />
                            Self-Care Plan
                        </h2>
                        <p className="text-slate-400 mt-1">Manage your personal wellness strategies for the voice journey.</p>
                    </div>

                    <div className="p-6">
                        {selfCarePlan && SelfCareService.hasCompletedPlan() ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Check className="text-green-400" size={16} />
                                        <h3 className="font-bold text-white">Plan Active</h3>
                                    </div>
                                    <p className="text-sm text-slate-400">Your self-care strategies are set and ready.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            SelfCareService.clearSelfCarePlan();
                                            setSelfCarePlan(null);
                                            setStatus({ type: 'success', message: 'Plan cleared.' });
                                            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
                                        }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Clear
                                    </button>
                                    <button
                                        onClick={() => setShowSelfCareWizard(true)}
                                        className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Edit3 size={16} /> Edit Plan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-pink-900/10 rounded-xl border border-pink-500/20">
                                <div>
                                    <h3 className="font-bold text-pink-100">No Plan Set</h3>
                                    <p className="text-sm text-pink-300/80">Create a plan to support your emotional well-being.</p>
                                </div>
                                <button
                                    onClick={() => setShowSelfCareWizard(true)}
                                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Heart size={16} /> Create Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Voice Baseline Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-purple-400" size={24} />
                            Voice Baseline
                        </h2>
                        <p className="text-slate-400 mt-1">Capture your voice baseline for personalized progress tracking.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {baselineData ? (
                            <>
                                {/* Baseline Summary */}
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">Average Pitch</div>
                                            <div className="text-xl font-bold text-purple-400">
                                                {Math.round(baselineData.pitch?.mean || 0)} Hz
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">Pitch Range</div>
                                            <div className="text-lg font-medium text-slate-300">
                                                {Math.round(baselineData.pitch?.min || 0)} - {Math.round(baselineData.pitch?.max || 0)} Hz
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">F1 (Formant 1)</div>
                                            <div className="text-lg font-medium text-pink-400">
                                                {Math.round(baselineData.formants?.f1?.mean || 0)} Hz
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">F2 (Formant 2)</div>
                                            <div className="text-lg font-medium text-pink-400">
                                                {Math.round(baselineData.formants?.f2?.mean || 0)} Hz
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Recorded: {baselineData.analyzedAt
                                            ? new Date(baselineData.analyzedAt).toLocaleString()
                                            : 'Unknown'}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowCalibrationWizard(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                                    >
                                        <TrendingUp size={18} />
                                        Recalibrate
                                    </button>
                                    <button
                                        onClick={handleClearBaseline}
                                        className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                        Clear
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No Baseline Set</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Record a sample of your voice to enable personalized progress tracking and comparison overlays.
                                </p>
                                <button
                                    onClick={() => setShowCalibrationWizard(true)}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                                >
                                    Calibrate My Voice
                                </button>
                            </div>
                        )}

                        {/* Show Baseline Comparison Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Show Baseline Comparison</h3>
                                <p className="text-sm text-slate-400">Display baseline overlays on pitch and formant visualizations.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ ...settings, showBaselineComparison: !settings.showBaselineComparison })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.showBaselineComparison ? 'bg-purple-500' : 'bg-slate-700'}`}
                                aria-label="Toggle Baseline Comparison"
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.showBaselineComparison ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe className="text-blue-400" size={24} />
                            {t('settings.language.title')}
                        </h2>
                        <p className="text-slate-400 mt-1">{t('settings.language.description')}</p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => updateSettings({ ...settings, language: 'en' })}
                                className={`flex-1 p-4 rounded-xl border transition-all ${settings.language === 'en'
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className="font-bold">English</span>
                            </button>
                            <button
                                onClick={() => updateSettings({ ...settings, language: 'es' })}
                                className={`flex-1 p-4 rounded-xl border transition-all ${settings.language === 'es'
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className="font-bold">Español</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visualization Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="text-blue-400" size={24} />
                            {t('settings.visualizations.title')}
                        </h2>
                        <p className="text-slate-400 mt-1">{t('settings.visualizations.description')}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Show Norms Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">{t('settings.visualizations.showNorms.title')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.visualizations.showNorms.description')}</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ ...settings, showNorms: !settings.showNorms })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.showNorms ? 'bg-blue-500' : 'bg-slate-700'}`}
                                aria-label="Toggle Standardized Norms"
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.showNorms ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Spectrogram Color Scheme */}
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="mb-3">
                                <h3 className="font-bold text-white">{t('settings.visualizations.colorScheme.title', 'Spectrogram Colors')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.visualizations.colorScheme.description', 'Choose a color palette for spectrogram visualizations')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(COLORMAP_PRESETS).map(([key, { name, icon }]) => (
                                    <button
                                        key={key}
                                        onClick={() => updateSettings({ ...settings, spectrogramColorScheme: key })}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${settings.spectrogramColorScheme === key
                                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                        aria-label={`Set color scheme to ${name}`}
                                    >
                                        <span className="text-lg">{icon}</span>
                                        <span className="font-medium">{name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accessibility Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="text-purple-400" size={24} />
                            {t('settings.accessibility.title')}
                        </h2>
                        <p className="text-slate-400 mt-1">{t('settings.accessibility.description')}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* High Contrast */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">{t('settings.accessibility.highContrast.title')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.accessibility.highContrast.description')}</p>
                            </div>
                            <button
                                onClick={() => updateSettings({
                                    ...settings,
                                    accessibility: { ...settings.accessibility, highContrast: !settings.accessibility?.highContrast }
                                })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.accessibility?.highContrast ? 'bg-purple-500' : 'bg-slate-700'}`}
                                aria-label="Toggle High Contrast Mode"
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.accessibility?.highContrast ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">{t('settings.accessibility.fontSize.title')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.accessibility.fontSize.description')}</p>
                            </div>
                            <div className="flex gap-2">
                                {['normal', 'large', 'xl'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => updateSettings({
                                            ...settings,
                                            accessibility: { ...settings.accessibility, fontSize: size }
                                        })}
                                        className={`px-4 py-2 rounded-lg border transition-all ${settings.accessibility?.fontSize === size
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                        aria-label={`Set font size to ${size}`}
                                    >
                                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileJson className="text-teal-400" size={24} />
                            {t('settings.data.title')}
                        </h2>
                        <p className="text-slate-400 mt-1">{t('settings.data.description')}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Export */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">{t('settings.data.export.title')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.data.export.description')}</p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                <Download size={18} />
                                {t('settings.data.export.button')}
                            </button>
                        </div>

                        {/* Import */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">{t('settings.data.import.title')}</h3>
                                <p className="text-sm text-slate-400">{t('settings.data.import.description')}</p>
                            </div>
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer">
                                <Upload size={18} />
                                {t('settings.data.import.button')}
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Factory Reset */}
                        <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                            <div>
                                <h3 className="font-bold text-red-400">{t('settings.data.reset.title')}</h3>
                                <p className="text-sm text-red-300/70">{t('settings.data.reset.description')}</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isResetting
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    }`}
                            >
                                <Trash2 size={18} />
                                {isResetting ? t('settings.data.reset.confirm') : t('settings.data.reset.button')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
