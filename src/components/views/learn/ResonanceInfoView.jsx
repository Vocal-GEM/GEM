import { useState } from 'react';
import { Speaker, ChevronDown, ChevronUp, ExternalLink, Info, Sparkles, Volume2 } from 'lucide-react';

/**
 * ResonanceInfoView - Educational article about vocal resonance
 */
const ResonanceInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        difference: true,
        techniques: true,
        exercises: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const resonanceComparison = [
        { aspect: 'Physical mechanism', chest: 'Lower larynx, larger vocal tract', head: 'Higher larynx, smaller vocal tract' },
        { aspect: 'Sound quality', chest: 'Dark, deep, full', head: 'Bright, light, forward' },
        { aspect: 'Formant frequencies', chest: 'Lower F1, F2, F3', head: 'Higher F1, F2, F3' },
        { aspect: 'Gender association', chest: 'More masculine perception', head: 'More feminine perception' }
    ];

    const SectionHeader = ({ title, icon: Icon, section, color = 'blue' }) => (
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

    const DataTable = ({ headers, rows }) => (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-800/50">
                        {headers.map((header, i) => (
                            <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-slate-300 border-b border-slate-700/50">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            {Object.values(row).map((cell, j) => (
                                <td key={j} className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 ? 'font-semibold text-blue-300' : 'text-slate-300'}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                        <Speaker className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                            Resonance & Brightness
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Understanding vocal tract resonance and techniques for forward placement.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="What is Resonance?" icon={Speaker} section="general" color="blue" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Resonance</strong> refers to how sound is amplified and
                                shaped by the spaces in your vocal tract—the throat (pharynx), mouth (oral cavity),
                                and nasal passages. These spaces act as <strong className="text-blue-300">resonating chambers</strong>
                                that filter and enhance certain frequencies while dampening others.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                The result is the <strong className="text-white">timbre</strong> or &quot;color&quot; of your voice—
                                what makes your voice sound uniquely like you, and what contributes significantly
                                to how others perceive your gender.
                            </p>

                            <NoteBox type="tip">
                                <strong>Key insight:</strong> Research shows that resonance may actually be
                                <em> more important</em> than pitch for gender perception. A voice with feminine
                                resonance at a lower pitch can be perceived as more feminine than a high-pitched
                                voice with masculine resonance.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                You can think of resonance as the &quot;brightness&quot; or &quot;darkness&quot; of your voice:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li><strong className="text-cyan-300">Bright/forward resonance:</strong> Smaller vocal tract → higher formants → feminine perception</li>
                                <li><strong className="text-cyan-300">Dark/back resonance:</strong> Larger vocal tract → lower formants → masculine perception</li>
                            </ul>
                        </div>
                    )}
                </section>

                {/* Difference Section */}
                <section>
                    <SectionHeader title="Resonance vs Pitch" icon={Sparkles} section="difference" color="purple" />
                    {expandedSections.difference && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Many people confuse resonance with pitch, but they are controlled by
                                <strong className="text-white"> completely different mechanisms</strong>:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30">
                                    <h4 className="font-bold text-cyan-300 mb-2">Pitch (F0)</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• Controlled by <strong>vocal fold tension</strong></li>
                                        <li>• How fast the folds vibrate</li>
                                        <li>• Measured in Hz</li>
                                        <li>• Think: musical note</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                                    <h4 className="font-bold text-purple-300 mb-2">Resonance</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• Controlled by <strong>vocal tract shape</strong></li>
                                        <li>• How sound is filtered</li>
                                        <li>• Measured as formants (F1, F2, F3)</li>
                                        <li>• Think: instrument body</li>
                                    </ul>
                                </div>
                            </div>

                            <NoteBox type="info">
                                A helpful analogy: If pitch is the <em>note</em> being played, resonance is the
                                <em> instrument</em> playing it. A C note sounds different on a guitar vs a piano,
                                even though it&apos;s the same pitch—that difference is resonance.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Techniques Section */}
                <section>
                    <SectionHeader title="How to Adjust Resonance" icon={Volume2} section="techniques" color="teal" />
                    {expandedSections.techniques && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                To achieve brighter, more forward resonance, you can modify several aspects
                                of your vocal tract:
                            </p>

                            <DataTable
                                headers={['Aspect', 'Chest Resonance', 'Head Resonance']}
                                rows={resonanceComparison}
                            />

                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Key Adjustments</h3>

                            <div className="space-y-3">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-blue-300 mb-1">Larynx Position</h4>
                                    <p className="text-sm text-slate-400">
                                        A slightly raised larynx shortens the vocal tract, raising all formant
                                        frequencies. You can feel this by placing your finger on your Adam&apos;s apple
                                        and swallowing—notice how it rises.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-blue-300 mb-1">Tongue Position</h4>
                                    <p className="text-sm text-slate-400">
                                        A forward tongue position (fronting) raises F2, which is strongly
                                        associated with feminine perception. Think of keeping your tongue
                                        slightly higher and more forward in your mouth.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-blue-300 mb-1">Lip Position</h4>
                                    <p className="text-sm text-slate-400">
                                        Lip spreading (as in a subtle smile) shortens the vocal tract and
                                        raises formants. Lip rounding does the opposite.
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="warning">
                                <strong>Important:</strong> These adjustments should be subtle and comfortable.
                                Extreme larynx raising or tension can cause strain. The goal is a gentle,
                                sustainable position—not a squeezed or strained voice.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Exercises Section */}
                <section>
                    <SectionHeader title="Practice Exercises" icon={Sparkles} section="exercises" color="emerald" />
                    {expandedSections.exercises && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Big Dog / Small Dog</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        This exercise develops kinesthetic awareness of larynx position.
                                    </p>
                                    <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                                        <li>Pant like a large dog (pit bull)—feel your larynx low</li>
                                        <li>Progressively pant like smaller dogs (spaniel → chihuahua)</li>
                                        <li>Notice how your larynx naturally rises</li>
                                        <li>At &quot;small dog,&quot; transition to &quot;ha ha ha&quot; sounds</li>
                                        <li>Progress to words: &quot;hi,&quot; &quot;hello,&quot; &quot;happy&quot;</li>
                                    </ol>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Whisper Siren</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Practice resonance without pitch interference.
                                    </p>
                                    <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                                        <li>Breathe out in a whispered sigh (no voice)</li>
                                        <li>Raise the &quot;pitch&quot; of this whisper upward</li>
                                        <li>The sound becomes a higher hiss at the peak</li>
                                        <li>Hold the highest comfortable position</li>
                                        <li>Repeat 10-50 times daily</li>
                                    </ol>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-300 mb-2">Nasal Consonant Words</h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                        Words with &quot;m&quot; and &quot;n&quot; help establish forward resonance.
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Practice: &quot;mean,&quot; &quot;name,&quot; &quot;need,&quot; &quot;nine,&quot; &quot;morning,&quot;
                                        &quot;meeting,&quot; &quot;amazing.&quot; Focus on feeling the vibration in your
                                        face and nasal areas rather than your chest.
                                    </p>
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
                        <li>Carew, L., Dacakis, G., & Oates, J. (2007). The effectiveness of oral resonance therapy on the perception of femininity of voice in male-to-female transsexuals.</li>
                        <li>Gelfer, M. P., & Mikos, V. A. (2005). The relative contributions of speaking fundamental frequency and formant frequencies to gender identification.</li>
                        <li>Oates, J., & Dacakis, G. (1997). Voice change in transsexuals.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default ResonanceInfoView;
