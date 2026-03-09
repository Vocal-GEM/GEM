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
        voiceType: feminine&apos;,
        priority: &apos;balanced&apos;,
        timeline: &apos;moderate&apos;,

        // Health
        onHRT: false,
        hrtType: &apos;&apos;,
        hrtDuration: 0,
        hasHadVFS: false,
        vfsDate: &apos;&apos;,

        // Experience
        singingExperience: &apos;none&apos;,
        voiceTrainingExperience: &apos;none&apos;,

        // Learning Style (Self-reported)
        selfReportedStyle: &apos;visual&apos;,
        sessionLength: &apos;short&apos;
    });

    const steps = [
        { id: &apos;welcome&apos;, title: &apos;Welcome to Vocal GEM&apos; },
        { id: &apos;goals&apos;, title: &apos;Your Voice Goals&apos; },
        { id: &apos;health&apos;, title: &apos;Voice & Health History&apos; },
        { id: &apos;experience&apos;, title: &apos;Experience Level&apos; },
        { id: &apos;preferences&apos;, title: &apos;Learning Preferences&apos; },
        { id: &apos;summary&apos;, title: &apos;Profile Summary&apos; }
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
                        {step === steps.length - 1 ? Complete Profile&apos; : &apos;Next&apos;}
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
                🔒 Your data is stored locally and private to you. We only capture whats needed to help you find your voice.
            </p>
        </div>
    </div>
);

const GoalsStep = ({ data, update }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-gray-300 mb-2 font-medium">Target Voice Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[feminine&apos;, &apos;masculine&apos;, &apos;androgynous&apos;].map(type => (
                    <button
                        key={type}
                        onClick={() => update(voiceType&apos;, type)}
                        className={`p-4 rounded-xl border transition-all ${data.voiceType === type
                                ? &apos;bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750&apos;
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
                {[pitch&apos;, &apos;resonance&apos;, &apos;weight&apos;, &apos;balanced&apos;].map(priority => (
                    <button
                        key={priority}
                        onClick={() => update(priority&apos;, priority)}
                        className={`p-3 rounded-lg border text-sm transition-all ${data.priority === priority
                                ? &apos;bg-pink-600/20 border-pink-500 text-pink-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
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
                    { id: gentle&apos;, label: &apos;Gentle&apos;, desc: &apos;Slow & steady&apos; },
                    { id: &apos;moderate&apos;, label: &apos;Moderate&apos;, desc: &apos;Consistent work&apos; },
                    { id: &apos;aggressive&apos;, label: &apos;Aggressive&apos;, desc: &apos;Intensive training&apos; }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update(timeline&apos;, opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.timeline === opt.id
                                ? &apos;bg-blue-600/20 border-blue-500 text-blue-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
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
                    onChange={(e) => update(onHRT&apos;, e.target.checked)}
                    className=w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700&quot;
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
                            onChange={(e) => update(hrtType&apos;, e.target.value)}
                            className=w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
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
                            onChange={(e) => update(hrtDuration&apos;, e.target.value)}
                            className=w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
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
                    onChange={(e) => update(hasHadVFS&apos;, e.target.checked)}
                    className=w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700&quot;
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
                            onChange={(e) => update(vfsDate&apos;, e.target.value)}
                            className=w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
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
                {[none&apos;, &apos;beginner&apos;, &apos;intermediate&apos;, &apos;advanced&apos;, &apos;professional&apos;].map(level => (
                    <button
                        key={level}
                        onClick={() => update(singingExperience&apos;, level)}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${data.singingExperience === level
                                ? &apos;bg-purple-600/20 border-purple-500 text-purple-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
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
                    { id: visual&apos;, icon: &apos;👁️&apos;, label: &apos;Visual&apos;, desc: &apos;Graphs & Charts&apos; },
                    { id: &apos;auditory&apos;, icon: &apos;👂&apos;, label: &apos;Auditory&apos;, desc: &apos;Listening & Mimicry&apos; },
                    { id: &apos;kinesthetic&apos;, icon: &apos;✋&apos;, label: &apos;Hands-on&apos;, desc: &apos;Doing & Feeling&apos; }
                ].map(style => (
                    <button
                        key={style.id}
                        onClick={() => update(selfReportedStyle&apos;, style.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${data.selfReportedStyle === style.id
                                ? &apos;bg-cyan-600/20 border-cyan-500 text-cyan-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
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
                    { id: micro&apos;, label: &apos;Micro (2-5m)&apos;, desc: &apos;Quick check-ins&apos; },
                    { id: &apos;short&apos;, label: &apos;Short (10-15m)&apos;, desc: &apos;Standard practice&apos; },
                    { id: &apos;standard&apos;, label: &apos;Medium (20-30m)&apos;, desc: &apos;Deep dive&apos; },
                    { id: &apos;long&apos;, label: &apos;Long (45m+)&apos;, desc: &apos;Intensive session&apos; },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update(sessionLength&apos;, opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.sessionLength === opt.id
                                ? &apos;bg-green-600/20 border-green-500 text-green-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
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
            Click Complete Profile&quot; to generate your personalized roadmap.
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
