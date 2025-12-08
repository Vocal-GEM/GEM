import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, ExternalLink, Info, TrendingUp, Music } from 'lucide-react';

/**
 * IntonationInfoView - Educational article about intonation and prosody
 */
const IntonationInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        patterns: true,
        gender: true,
        exercises: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const SectionHeader = ({ title, icon: Icon, section, color = 'pink' }) => (
        <button
            onClick={() => toggleSection(section)}
            className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-${color}-900/30 to-transparent rounded-xl border border-${color}-500/20 hover:border-${color}-500/40 transition-all group`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            {expandedSections[section] ? (
                <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            )}
        </button>
    );

    const NoteBox = ({ children, type = 'info' }) => {
        const styles = {
            info: 'bg-blue-900/20 border-blue-500/30 text-blue-200',
            warning: 'bg-amber-900/20 border-amber-500/30 text-amber-200',
            tip: 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200'
        };

        return (
            <div className={`p-4 rounded-xl border ${styles[type]} my-4`}>
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm leading-relaxed">{children}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30">
                        <MessageSquare className="w-8 h-8 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-red-400">
                            Intonation & Prosody
                        </h1>
                        <p className="text-slate-400 mt-1">
                            The melody and rhythm of speech that conveys meaning and emotion.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="What is Intonation?" icon={MessageSquare} section="general" color="pink" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Intonation</strong> refers to the rise and fall of pitch
                                during speech. Unlike the fixed &quot;average pitch&quot; we discuss elsewhere, intonation
                                is about <strong className="text-pink-300">pitch movement</strong>—how your voice goes up
                                and down as you speak.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Prosody</strong> is a broader term that includes intonation
                                plus rhythm, stress, and pacing. Together, these elements give speech its &quot;music&quot; and
                                convey:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li><strong className="text-pink-300">Meaning:</strong> Questions vs statements, emphasis</li>
                                <li><strong className="text-pink-300">Emotion:</strong> Excitement, sadness, sarcasm</li>
                                <li><strong className="text-pink-300">Social signals:</strong> Politeness, interest, attitude</li>
                                <li><strong className="text-pink-300">Identity:</strong> Including perceived gender</li>
                            </ul>

                            <NoteBox type="info">
                                Research shows that intonation patterns can significantly influence gender perception,
                                especially when average pitch is in the androgynous range (135-175 Hz). More varied,
                                melodic intonation tends to be perceived as more feminine.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Patterns Section */}
                <section>
                    <SectionHeader title="Common Intonation Patterns" icon={TrendingUp} section="patterns" color="rose" />
                    {expandedSections.patterns && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Different sentence types typically have characteristic intonation patterns:
                            </p>

                            <div className="space-y-4 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-pink-300">Statements ↘</h4>
                                        <span className="text-xs text-slate-500">Falling contour</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Pitch typically falls at the end of declarative sentences.
                                    </p>
                                    <p className="text-sm text-pink-300 italic">&quot;I went to the store.&quot; ↘</p>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-rose-300">Yes/No Questions ↗</h4>
                                        <span className="text-xs text-slate-500">Rising contour</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Pitch rises at the end when expecting a yes/no answer.
                                    </p>
                                    <p className="text-sm text-rose-300 italic">&quot;Did you go to the store?&quot; ↗</p>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-red-300">WH-Questions ↘</h4>
                                        <span className="text-xs text-slate-500">Falling contour</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Questions starting with who, what, where, etc. typically fall.
                                    </p>
                                    <p className="text-sm text-red-300 italic">&quot;Where did you go?&quot; ↘</p>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-orange-300">Lists ↗ ↗ ↘</h4>
                                        <span className="text-xs text-slate-500">Rise-rise-fall</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Items rise except the final one, which falls.
                                    </p>
                                    <p className="text-sm text-orange-300 italic">&quot;I bought apples↗, oranges↗, and bananas↘.&quot;</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Gender Section */}
                <section>
                    <SectionHeader title="Intonation & Gender Perception" icon={Music} section="gender" color="purple" />
                    {expandedSections.gender && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Research has identified some patterns in how intonation relates to gender perception:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-pink-900/20 rounded-xl border border-pink-500/30">
                                    <h4 className="font-bold text-pink-300 mb-2">Feminine-Associated Patterns</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• Greater pitch variation</li>
                                        <li>• More dynamic, melodic contours</li>
                                        <li>• Higher intonation peaks</li>
                                        <li>• More expressive emphasis</li>
                                        <li>• Uptalk in some contexts</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                                    <h4 className="font-bold text-blue-300 mb-2">Masculine-Associated Patterns</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• Less pitch variation</li>
                                        <li>• Flatter, more monotone delivery</li>
                                        <li>• Lower intonation peaks</li>
                                        <li>• More restrained emphasis</li>
                                        <li>• More frequent creaky endings</li>
                                    </ul>
                                </div>
                            </div>

                            <NoteBox type="tip">
                                <strong>Key insight:</strong> When average pitch is in the gender-neutral range
                                (around 145-180 Hz), intonation patterns become <em>more</em> influential for perception.
                                Using varied, dynamic intonation can help a voice be perceived as more feminine even
                                at lower average pitches.
                            </NoteBox>

                            <NoteBox type="info">
                                <strong>Important caveat:</strong> These are general tendencies, not rules. Individual
                                variation is huge, and many successful communicators of all genders use various
                                intonation styles. The goal is finding patterns that feel authentic to you.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Exercises Section */}
                <section>
                    <SectionHeader title="Practice Exercises" icon={Music} section="exercises" color="emerald" />
                    {expandedSections.exercises && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Glide and Slide</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Practice exaggerated pitch movement on phrases:
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• &quot;We GLIDE then slide&quot; - emphasize GLIDE with a pitch peak</li>
                                        <li>• &quot;I WANT to go&quot; - peak on WANT</li>
                                        <li>• &quot;I LOVE your shoes&quot; - enthusiastic rise on LOVE</li>
                                    </ul>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Start exaggerated, then gradually make it more natural.
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Emotional Reading</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Read the same sentence with different emotions:
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• Excited: &quot;I can&apos;t believe it!&quot; ⬆️</li>
                                        <li>• Questioning: &quot;I can&apos;t believe it?&quot; ↗</li>
                                        <li>• Disappointed: &quot;I can&apos;t believe it...&quot; ↘</li>
                                        <li>• Sarcastic: &quot;I <em>can&apos;t</em> believe it.&quot;</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Question Practice</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Practice the natural rise for yes/no questions:
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• &quot;Would you like some coffee?&quot; ↗</li>
                                        <li>• &quot;Are you coming with us?&quot; ↗</li>
                                        <li>• &quot;Do you know what time it is?&quot; ↗</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Conversational Phrases</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Practice common phrases with natural feminine intonation:
                                    </p>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• &quot;Oh REALly?&quot; (genuine interest)</li>
                                        <li>• &quot;That&apos;s so NICE!&quot; (appreciation)</li>
                                        <li>• &quot;I KNOW, right?&quot; (agreement/enthusiasm)</li>
                                        <li>• &quot;Thank you SO much!&quot; (gratitude)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* References */}
                <section className="mt-8 p-6 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-slate-400" />
                        References
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
                        <li>Wolfe, V. I., et al. (1990). Intonation and fundamental frequency in male-to-female transsexuals.</li>
                        <li>Hancock, A. B., & Garabedian, L. M. (2013). Transgender voice and communication treatment: A retrospective chart review.</li>
                        <li>Van Borsel, J., et al. (2000). Intonation of homosexual males: A pilot study.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default IntonationInfoView;
