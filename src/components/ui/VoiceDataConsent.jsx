import { useState, useEffect } from 'react';
import {
    X,
    Shield,
    Database,
    UserCheck,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    ExternalLink
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * VoiceDataConsent - Opt-in consent modal for anonymous voice data collection
 * 
 * Features:
 * - Clear explanation of data usage
 * - Privacy-first design (anonymized, no PII)
 * - Easy opt-in/opt-out
 * - Stored locally first, optional cloud sync
 */
const VoiceDataConsent = ({ isOpen, onClose, onConsentChange }) => {
    const { voiceDataConsent, setVoiceDataConsent } = useSettings();
    const [currentConsent, setCurrentConsent] = useState({
        enabled: false,
        anonymousUpload: false,
        localStorageOnly: true,
        includeGenderLabel: false,
        acknowledgedAt: null
    });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (voiceDataConsent) {
            setCurrentConsent(voiceDataConsent);
        }
    }, [voiceDataConsent]);

    const handleSaveConsent = () => {
        const updatedConsent = {
            ...currentConsent,
            acknowledgedAt: new Date().toISOString()
        };
        setVoiceDataConsent(updatedConsent);
        if (onConsentChange) {
            onConsentChange(updatedConsent);
        }
        onClose();
    };

    const handleToggle = (key) => {
        setCurrentConsent(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-500/20">
                            <Database className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Voice Data Collection</h2>
                            <p className="text-xs text-slate-400">Help improve gender classification</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Main Explanation */}
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
                        <p className="text-sm text-slate-200 leading-relaxed">
                            <strong className="text-purple-300">Optional:</strong> Contribute anonymous voice samples
                            to help train better gender classification models. Your participation helps create
                            more inclusive AI that better understands gender-diverse voices.
                        </p>
                    </div>

                    {/* Privacy Assurances */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Shield size={14} className="text-green-400" />
                            Privacy Guarantees
                        </h3>
                        <div className="grid gap-2 text-xs">
                            <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">
                                    <strong>No identifying info stored</strong> - Only acoustic features, no voice recordings
                                </span>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">
                                    <strong>Local-first</strong> - Data stays on your device unless you opt into upload
                                </span>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">
                                    <strong>Opt-out anytime</strong> - Delete your data with one click
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Consent Options */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white">Your Choices</h3>

                        {/* Main Enable Toggle */}
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCheck size={16} className={currentConsent.enabled ? 'text-green-400' : 'text-slate-500'} />
                                    <span className="text-sm font-medium text-white">Enable data collection</span>
                                </div>
                                <button
                                    onClick={() => handleToggle('enabled')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${currentConsent.enabled ? 'bg-green-500' : 'bg-slate-700'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${currentConsent.enabled ? 'left-6' : 'left-0.5'
                                            }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 ml-6">
                                Collect anonymous voice features to improve ML models
                            </p>
                        </div>

                        {currentConsent.enabled && (
                            <>
                                {/* Anonymous Upload Toggle */}
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 ml-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {currentConsent.anonymousUpload ? (
                                                <Eye size={16} className="text-blue-400" />
                                            ) : (
                                                <EyeOff size={16} className="text-slate-500" />
                                            )}
                                            <span className="text-sm text-white">Allow anonymous upload</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('anonymousUpload')}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${currentConsent.anonymousUpload ? 'bg-blue-500' : 'bg-slate-700'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${currentConsent.anonymousUpload ? 'left-6' : 'left-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 ml-6">
                                        {currentConsent.anonymousUpload
                                            ? 'Features will be securely uploaded to help train models'
                                            : 'Data stays only on this device'}
                                    </p>
                                </div>

                                {/* Include Gender Label Toggle */}
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 ml-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white">Include self-reported gender</span>
                                            <button
                                                onClick={() => setShowDetails(!showDetails)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <HelpCircle size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleToggle('includeGenderLabel')}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${currentConsent.includeGenderLabel ? 'bg-purple-500' : 'bg-slate-700'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${currentConsent.includeGenderLabel ? 'left-6' : 'left-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    {showDetails && (
                                        <p className="text-xs text-purple-300 mt-2 p-2 bg-purple-500/10 rounded-lg">
                                            Optionally tag your samples with your gender identity.
                                            This helps train models on gender-diverse voices specifically.
                                            Completely optional - skip if you prefer not to share.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* What We Collect */}
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <h4 className="text-xs font-bold text-slate-300 mb-2">What we collect (if enabled):</h4>
                        <ul className="text-[10px] text-slate-400 space-y-1">
                            <li>• Spectral features (pitch, formants, spectral centroid)</li>
                            <li>• ML prediction scores</li>
                            <li>• Timestamp (date only, no exact time)</li>
                            <li>• Anonymous session ID (not linked to your account)</li>
                        </ul>
                        <p className="text-[10px] text-slate-500 mt-2 italic">
                            We never store raw audio recordings.
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200">
                            While we take precautions, voice data may still contain unique characteristics.
                            Only participate if you&apos;re comfortable contributing to research.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <a
                        href="/privacy-policy"
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                    >
                        Privacy Policy
                        <ExternalLink size={10} />
                    </a>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveConsent}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceDataConsent;
