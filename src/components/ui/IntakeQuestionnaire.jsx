import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';
import { useTranslation } from 'react-i18next'; // Assuming i18n is available, or remove if not

const IntakeQuestionnaire = ({ onComplete, onClose }) => {
    const { updateGoals, updateHealth, profile } = useVoiceProfile();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        // Goals
        voiceType: 'feminine',
        priority: 'balanced',
        timeline: 'moderate',

        // Health
        onHRT: false,
        hrtType: '',
        hrtDuration: 0,
        hasHadVFS: false,
        vfsDate: '',

        // Experience
        singingExperience: 'none',
        voiceTrainingExperience: 'none',

        // Learning Style (Self-reported)
        selfReportedStyle: 'visual',
        sessionLength: 'short'
    });

    const steps = [
        { id: 'welcome', title: 'Welcome to Vocal GEM' },
        { id: 'goals', title: 'Your Voice Goals' },
        { id: 'health', title: 'Voice & Health History' },
        { id: 'experience', title: 'Experience Level' },
        { id: 'preferences', title: 'Learning Preferences' },
        { id: 'summary', title: 'Profile Summary' }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        // Save to context
        updateGoals({
            voiceType: formData.voiceType,
            priority: formData.priority,
            timeline: formData.timeline
        });

        updateHealth({
            onHRT: formData.onHRT,
            hrtType: formData.hrtType,
            hrtDuration: parseInt(formData.hrtDuration) || 0,
            hasHadVFS: formData.hasHadVFS,
            vfsDate: formData.vfsDate,
            singingExperience: formData.singingExperience,
            voiceTrainingExperience: formData.voiceTrainingExperience
        });

        // Assuming we have a method to update preferences directly or via profile update
        // keeping it simple for now as per Context API

        if (onComplete) onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            {steps[step].title}
                        </h2>
                        <div className="flex gap-1 mt-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 w-8 rounded-full transition-colors ${idx <= step ? 'bg-purple-500' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 0 && <WelcomeStep />}
                            {step === 1 && <GoalsStep data={formData} update={updateField} />}
                            {step === 2 && <HealthStep data={formData} update={updateField} />}
                            {step === 3 && <ExperienceStep data={formData} update={updateField} />}
                            {step === 4 && <PreferencesStep data={formData} update={updateField} />}
                            {step === 5 && <SummaryStep data={formData} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={step === 0}
                        className={`px-6 py-2 rounded-lg text-gray-400 hover:text-white transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20"
                    >
                        {step === steps.length - 1 ? 'Complete Profile' : 'Next'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Step Components ---

const WelcomeStep = () => (
    <div className="space-y-4">
        <p className="text-gray-300 text-lg">
            To give you the most personalized voice training experience, we need to know a little bit about you, your goals, and your history.
        </p>
        <p className="text-gray-400">
            This will allow our AI to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
            <li>Recommend realistic pitch and resonance targets</li>
            <li>Predict your progress timeline</li>
            <li>Adjust feedback sensitivity to your skill level</li>
            <li>Tailor exercises to your learning style</li>
        </ul>
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
                🔒 Your data is stored locally and private to you. We only capture what's needed to help you find your voice.
            </p>
        </div>
    </div>
);

const GoalsStep = ({ data, update }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-gray-300 mb-2 font-medium">Target Voice Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['feminine', 'masculine', 'androgynous'].map(type => (
                    <button
                        key={type}
                        onClick={() => update('voiceType', type)}
                        className={`p-4 rounded-xl border transition-all ${data.voiceType === type
                                ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                            }`}
                    >
                        <div className="text-lg font-bold capitalize">{type}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-gray-300 mb-2 font-medium">Primary Focus</label>
            <div className="grid grid-cols-2 gap-3">
                {['pitch', 'resonance', 'weight', 'balanced'].map(priority => (
                    <button
                        key={priority}
                        onClick={() => update('priority', priority)}
                        className={`p-3 rounded-lg border text-sm transition-all ${data.priority === priority
                                ? 'bg-pink-600/20 border-pink-500 text-pink-200'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        <span className="capitalize">{priority}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-gray-300 mb-2 font-medium">Desired Timeline</label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'gentle', label: 'Gentle', desc: 'Slow & steady' },
                    { id: 'moderate', label: 'Moderate', desc: 'Consistent work' },
                    { id: 'aggressive', label: 'Aggressive', desc: 'Intensive training' }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update('timeline', opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.timeline === opt.id
                                ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const HealthStep = ({ data, update }) => (
    <div className="space-y-6">
        <div>
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700">
                <input
                    type="checkbox"
                    checked={data.onHRT}
                    onChange={(e) => update('onHRT', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                />
                <span className="text-gray-200 font-medium">I am strictly on Hormone Replacement Therapy (HRT)</span>
            </label>

            {data.onHRT && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 ml-8 space-y-4 p-4 bg-gray-800/50 rounded-lg border-l-2 border-purple-500"
                >
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">HRT Type</label>
                        <select
                            value={data.hrtType}
                            onChange={(e) => update('hrtType', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        >
                            <option value="">Select Type</option>
                            <option value="estrogen">Estrogen (E)</option>
                            <option value="testosterone">Testosterone (T)</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Duration (Months)</label>
                        <input
                            type="number"
                            value={data.hrtDuration}
                            onChange={(e) => update('hrtDuration', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                </motion.div>
            )}
        </div>

        <div>
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700">
                <input
                    type="checkbox"
                    checked={data.hasHadVFS}
                    onChange={(e) => update('hasHadVFS', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                />
                <span className="text-gray-200 font-medium">I have had Vocal Surgery (VFS)</span>
            </label>
            {data.hasHadVFS && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 ml-8 space-y-4 p-4 bg-gray-800/50 rounded-lg border-l-2 border-pink-500"
                >
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Surgery Date (Approx)</label>
                        <input
                            type="date"
                            value={data.vfsDate}
                            onChange={(e) => update('vfsDate', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    </div>
);

const ExperienceStep = ({ data, update }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-gray-300 mb-2 font-medium">Singing Experience</label>
            <div className="space-y-2">
                {['none', 'beginner', 'intermediate', 'advanced', 'professional'].map(level => (
                    <button
                        key={level}
                        onClick={() => update('singingExperience', level)}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${data.singingExperience === level
                                ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        <span className="capitalize font-medium">{level}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const PreferencesStep = ({ data, update }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-gray-300 mb-2 font-medium">Learning Style</label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'visual', icon: '👁️', label: 'Visual', desc: 'Graphs & Charts' },
                    { id: 'auditory', icon: '👂', label: 'Auditory', desc: 'Listening & Mimicry' },
                    { id: 'kinesthetic', icon: '✋', label: 'Hands-on', desc: 'Doing & Feeling' }
                ].map(style => (
                    <button
                        key={style.id}
                        onClick={() => update('selfReportedStyle', style.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${data.selfReportedStyle === style.id
                                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="font-bold">{style.label}</div>
                        <div className="text-xs opacity-70">{style.desc}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-gray-300 mb-2 font-medium">Preferred Session Length</label>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'micro', label: 'Micro (2-5m)', desc: 'Quick check-ins' },
                    { id: 'short', label: 'Short (10-15m)', desc: 'Standard practice' },
                    { id: 'standard', label: 'Medium (20-30m)', desc: 'Deep dive' },
                    { id: 'long', label: 'Long (45m+)', desc: 'Intensive session' },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update('sessionLength', opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.sessionLength === opt.id
                                ? 'bg-green-600/20 border-green-500 text-green-200'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        <div className="font-bold text-sm">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const SummaryStep = ({ data }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-white text-center mb-6">Profile Ready!</h3>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
            <SummaryRow label="Voice Goal" value={data.voiceType} />
            <SummaryRow label="Primary Focus" value={data.priority} />
            <SummaryRow label="Factors" value={[
                data.onHRT ? 'HRT' : null,
                data.hasHadVFS ? 'Surgery' : null,
                data.singingExperience !== 'none' ? `Singer (${data.singingExperience})` : null
            ].filter(Boolean).join(', ') || 'None'} />
            <SummaryRow label="Learning Style" value={data.selfReportedStyle} />
        </div>

        <p className="text-center text-gray-400 mt-4">
            Click "Complete Profile" to generate your personalized roadmap.
        </p>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium capitalize">{value}</span>
    </div>
);

export default IntakeQuestionnaire;
