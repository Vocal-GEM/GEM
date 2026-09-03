import React, { useState } from &apos;react&apos;;
import { motion, AnimatePresence } from &apos;framer-motion&apos;;
import { useVoiceProfile } from &apos;../../context/VoiceProfileContext&apos;;
import { useTranslation } from &apos;react-i18next&apos;; // Assuming i18n is available, or remove if not

const IntakeQuestionnaire = ({ onComplete, onClose }) => {
    const { updateGoals, updateHealth, profile } = useVoiceProfile();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        // Goals
        voiceType: &apos;feminine&apos;,
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
        <div className=&quot;fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4&quot;>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className=&quot;bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]&quot;
            >
                {/* Header */}
                <div className=&quot;p-6 border-b border-gray-800 flex justify-between items-center&quot;>
                    <div>
                        <h2 className=&quot;text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent&quot;>
                            {steps[step].title}
                        </h2>
                        <div className=&quot;flex gap-1 mt-2&quot;>
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 w-8 rounded-full transition-colors ${idx <= step ? &apos;bg-purple-500&apos; : &apos;bg-gray-700&apos;
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className=&quot;p-8 overflow-y-auto flex-grow&quot;>
                    <AnimatePresence mode=&quot;wait&quot;>
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
                <div className=&quot;p-6 border-t border-gray-800 flex justify-between&quot;>
                    <button
                        onClick={handleBack}
                        disabled={step === 0}
                        className={`px-6 py-2 rounded-lg text-gray-400 hover:text-white transition-colors ${step === 0 ? &apos;opacity-0 pointer-events-none&apos; : &apos;&apos;
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className=&quot;px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20&quot;
                    >
                        {step === steps.length - 1 ? &apos;Complete Profile&apos; : &apos;Next&apos;}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Step Components ---

const WelcomeStep = () => (
    <div className=&quot;space-y-4&quot;>
        <p className=&quot;text-gray-300 text-lg&quot;>
            To give you the most personalized voice training experience, we need to know a little bit about you, your goals, and your history.
        </p>
        <p className=&quot;text-gray-400&quot;>
            This will allow our AI to:
        </p>
        <ul className=&quot;list-disc list-inside space-y-2 text-gray-300 ml-4&quot;>
            <li>Recommend realistic pitch and resonance targets</li>
            <li>Predict your progress timeline</li>
            <li>Adjust feedback sensitivity to your skill level</li>
            <li>Tailor exercises to your learning style</li>
        </ul>
        <div className=&quot;mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg&quot;>
            <p className=&quot;text-sm text-purple-300&quot;>
                🔒 Your data is stored locally and private to you. We only capture what&apos;s needed to help you find your voice.
            </p>
        </div>
    </div>
);

const GoalsStep = ({ data, update }) => (
    <div className=&quot;space-y-6&quot;>
        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Target Voice Type</label>
            <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-3&quot;>
                {[&apos;feminine&apos;, &apos;masculine&apos;, &apos;androgynous&apos;].map(type => (
                    <button
                        key={type}
                        onClick={() => update(&apos;voiceType&apos;, type)}
                        className={`p-4 rounded-xl border transition-all ${data.voiceType === type
                                ? &apos;bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750&apos;
                            }`}
                    >
                        <div className=&quot;text-lg font-bold capitalize&quot;>{type}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Primary Focus</label>
            <div className=&quot;grid grid-cols-2 gap-3&quot;>
                {[&apos;pitch&apos;, &apos;resonance&apos;, &apos;weight&apos;, &apos;balanced&apos;].map(priority => (
                    <button
                        key={priority}
                        onClick={() => update(&apos;priority&apos;, priority)}
                        className={`p-3 rounded-lg border text-sm transition-all ${data.priority === priority
                                ? &apos;bg-pink-600/20 border-pink-500 text-pink-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
                            }`}
                    >
                        <span className=&quot;capitalize&quot;>{priority}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Desired Timeline</label>
            <div className=&quot;grid grid-cols-3 gap-3&quot;>
                {[
                    { id: &apos;gentle&apos;, label: &apos;Gentle&apos;, desc: &apos;Slow & steady&apos; },
                    { id: &apos;moderate&apos;, label: &apos;Moderate&apos;, desc: &apos;Consistent work&apos; },
                    { id: &apos;aggressive&apos;, label: &apos;Aggressive&apos;, desc: &apos;Intensive training&apos; }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update(&apos;timeline&apos;, opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.timeline === opt.id
                                ? &apos;bg-blue-600/20 border-blue-500 text-blue-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
                            }`}
                    >
                        <div className=&quot;font-bold&quot;>{opt.label}</div>
                        <div className=&quot;text-xs opacity-70&quot;>{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const HealthStep = ({ data, update }) => (
    <div className=&quot;space-y-6&quot;>
        <div>
            <label className=&quot;flex items-center space-x-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700&quot;>
                <input
                    type=&quot;checkbox&quot;
                    checked={data.onHRT}
                    onChange={(e) => update(&apos;onHRT&apos;, e.target.checked)}
                    className=&quot;w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700&quot;
                />
                <span className=&quot;text-gray-200 font-medium&quot;>I am strictly on Hormone Replacement Therapy (HRT)</span>
            </label>

            {data.onHRT && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: &apos;auto&apos;, opacity: 1 }}
                    className=&quot;mt-4 ml-8 space-y-4 p-4 bg-gray-800/50 rounded-lg border-l-2 border-purple-500&quot;
                >
                    <div>
                        <label className=&quot;block text-gray-400 text-sm mb-1&quot;>HRT Type</label>
                        <select
                            value={data.hrtType}
                            onChange={(e) => update(&apos;hrtType&apos;, e.target.value)}
                            className=&quot;w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
                        >
                            <option value=&quot;&quot;>Select Type</option>
                            <option value=&quot;estrogen&quot;>Estrogen (E)</option>
                            <option value=&quot;testosterone&quot;>Testosterone (T)</option>
                            <option value=&quot;other&quot;>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className=&quot;block text-gray-400 text-sm mb-1&quot;>Duration (Months)</label>
                        <input
                            type=&quot;number&quot;
                            value={data.hrtDuration}
                            onChange={(e) => update(&apos;hrtDuration&apos;, e.target.value)}
                            className=&quot;w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
                        />
                    </div>
                </motion.div>
            )}
        </div>

        <div>
            <label className=&quot;flex items-center space-x-3 cursor-pointer p-3 bg-gray-800 rounded-lg border border-gray-700&quot;>
                <input
                    type=&quot;checkbox&quot;
                    checked={data.hasHadVFS}
                    onChange={(e) => update(&apos;hasHadVFS&apos;, e.target.checked)}
                    className=&quot;w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700&quot;
                />
                <span className=&quot;text-gray-200 font-medium&quot;>I have had Vocal Surgery (VFS)</span>
            </label>
            {data.hasHadVFS && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: &apos;auto&apos;, opacity: 1 }}
                    className=&quot;mt-4 ml-8 space-y-4 p-4 bg-gray-800/50 rounded-lg border-l-2 border-pink-500&quot;
                >
                    <div>
                        <label className=&quot;block text-gray-400 text-sm mb-1&quot;>Surgery Date (Approx)</label>
                        <input
                            type=&quot;date&quot;
                            value={data.vfsDate}
                            onChange={(e) => update(&apos;vfsDate&apos;, e.target.value)}
                            className=&quot;w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white&quot;
                        />
                    </div>
                </motion.div>
            )}
        </div>
    </div>
);

const ExperienceStep = ({ data, update }) => (
    <div className=&quot;space-y-6&quot;>
        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Singing Experience</label>
            <div className=&quot;space-y-2&quot;>
                {[&apos;none&apos;, &apos;beginner&apos;, &apos;intermediate&apos;, &apos;advanced&apos;, &apos;professional&apos;].map(level => (
                    <button
                        key={level}
                        onClick={() => update(&apos;singingExperience&apos;, level)}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${data.singingExperience === level
                                ? &apos;bg-purple-600/20 border-purple-500 text-purple-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
                            }`}
                    >
                        <span className=&quot;capitalize font-medium&quot;>{level}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const PreferencesStep = ({ data, update }) => (
    <div className=&quot;space-y-6&quot;>
        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Learning Style</label>
            <div className=&quot;grid grid-cols-3 gap-3&quot;>
                {[
                    { id: &apos;visual&apos;, icon: &apos;👁️&apos;, label: &apos;Visual&apos;, desc: &apos;Graphs & Charts&apos; },
                    { id: &apos;auditory&apos;, icon: &apos;👂&apos;, label: &apos;Auditory&apos;, desc: &apos;Listening & Mimicry&apos; },
                    { id: &apos;kinesthetic&apos;, icon: &apos;✋&apos;, label: &apos;Hands-on&apos;, desc: &apos;Doing & Feeling&apos; }
                ].map(style => (
                    <button
                        key={style.id}
                        onClick={() => update(&apos;selfReportedStyle&apos;, style.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${data.selfReportedStyle === style.id
                                ? &apos;bg-cyan-600/20 border-cyan-500 text-cyan-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
                            }`}
                    >
                        <div className=&quot;text-2xl mb-1&quot;>{style.icon}</div>
                        <div className=&quot;font-bold&quot;>{style.label}</div>
                        <div className=&quot;text-xs opacity-70&quot;>{style.desc}</div>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className=&quot;block text-gray-300 mb-2 font-medium&quot;>Preferred Session Length</label>
            <div className=&quot;grid grid-cols-2 gap-3&quot;>
                {[
                    { id: &apos;micro&apos;, label: &apos;Micro (2-5m)&apos;, desc: &apos;Quick check-ins&apos; },
                    { id: &apos;short&apos;, label: &apos;Short (10-15m)&apos;, desc: &apos;Standard practice&apos; },
                    { id: &apos;standard&apos;, label: &apos;Medium (20-30m)&apos;, desc: &apos;Deep dive&apos; },
                    { id: &apos;long&apos;, label: &apos;Long (45m+)&apos;, desc: &apos;Intensive session&apos; },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => update(&apos;sessionLength&apos;, opt.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${data.sessionLength === opt.id
                                ? &apos;bg-green-600/20 border-green-500 text-green-200&apos;
                                : &apos;bg-gray-800 border-gray-700 text-gray-400&apos;
                            }`}
                    >
                        <div className=&quot;font-bold text-sm&quot;>{opt.label}</div>
                        <div className=&quot;text-xs opacity-70&quot;>{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const SummaryStep = ({ data }) => (
    <div className=&quot;space-y-4&quot;>
        <h3 className=&quot;text-xl font-bold text-white text-center mb-6&quot;>Profile Ready!</h3>

        <div className=&quot;bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4&quot;>
            <SummaryRow label=&quot;Voice Goal&quot; value={data.voiceType} />
            <SummaryRow label=&quot;Primary Focus&quot; value={data.priority} />
            <SummaryRow label=&quot;Factors&quot; value={[
                data.onHRT ? &apos;HRT&apos; : null,
                data.hasHadVFS ? &apos;Surgery&apos; : null,
                data.singingExperience !== &apos;none&apos; ? `Singer (${data.singingExperience})` : null
            ].filter(Boolean).join(&apos;, &apos;) || &apos;None&apos;} />
            <SummaryRow label=&quot;Learning Style&quot; value={data.selfReportedStyle} />
        </div>

        <p className=&quot;text-center text-gray-400 mt-4&quot;>
            Click &quot;Complete Profile&quot; to generate your personalized roadmap.
        </p>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className=&quot;flex justify-between items-center border-b border-gray-700/50 pb-2 last:border-0 last:pb-0&quot;>
        <span className=&quot;text-gray-400&quot;>{label}</span>
        <span className=&quot;text-white font-medium capitalize&quot;>{value}</span>
    </div>
);

export default IntakeQuestionnaire;
