import { useState } from 'react';
import { Music2, ChevronDown, ChevronUp, ExternalLink, Info, Target, TrendingUp } from 'lucide-react';

/**
 * PitchInfoView - Educational article about pitch and fundamental frequency
 */
const PitchInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        ranges: true,
        training: true,
        health: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Pitch perception ranges
    const pitchRanges = [
        { classification: 'Masculine perception', range: '≤135 Hz', notes: 'Consistently perceived as male' },
        { classification: 'Androgynous zone', range: '135-175 Hz', notes: 'Ambiguous gender perception' },
        { classification: 'Feminine threshold', range: '≥165-168 Hz', notes: 'Increasing feminine perception' },
        { classification: 'Feminine target', range: '≥180 Hz', notes: 'Research consensus target' },
        { classification: 'Typical cis female', range: '188-221 Hz', notes: 'Natural speaking range (mean)' }
    ];

    // Training progression milestones
    const milestones = [
        { stage: 'Beginning', target: '135-165 Hz', description: 'Entering androgynous zone' },
        { stage: 'Developing', target: '165-180 Hz', description: 'Boundary region, some feminine perception' },
        { stage: 'Established', target: '180-220 Hz', description: 'Consistent feminine perception' },
        { stage: 'Advanced', target: '200-250 Hz', description: 'Expanded range with natural variation' }
    ];

    const SectionHeader = ({ title, icon: Icon, section, color = 'cyan' }) => (
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

    const DataTable = ({ headers, rows, highlightFirst = false }) => (
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
                                <td
                                    key={j}
                                    className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 && highlightFirst ? 'font-semibold text-cyan-300' : 'text-slate-300'
                                        }`}
                                >
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                        <Music2 className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                            Pitch & Fundamental Frequency
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Understanding F0, how pitch is perceived, and safe training practices.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="What is Pitch?" icon={Music2} section="general" color="cyan" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Pitch</strong> is the perceptual quality of sound that allows us
                                to judge sounds as &quot;higher&quot; or &quot;lower.&quot; In voice science, pitch is measured as
                                <strong className="text-cyan-300"> Fundamental Frequency (F0)</strong>, expressed in Hertz (Hz).
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                F0 is determined primarily by how fast your <strong className="text-white">vocal folds vibrate</strong>.
                                Faster vibration = higher pitch. Vocal fold vibration rate is controlled by:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li><strong className="text-cyan-300">Length</strong> - Longer folds vibrate slower (lower pitch)</li>
                                <li><strong className="text-cyan-300">Tension</strong> - Tighter folds vibrate faster (higher pitch)</li>
                                <li><strong className="text-cyan-300">Mass</strong> - Thicker folds vibrate slower (lower pitch)</li>
                            </ul>

                            <NoteBox type="info">
                                <strong>Key distinction:</strong> Pitch (F0) and resonance (formants) are different!
                                Pitch is about how fast your vocal folds vibrate, while resonance is about how your
                                vocal tract shapes the sound. Both contribute to perceived gender, but they&apos;re
                                trained differently.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Ranges Section */}
                <section>
                    <SectionHeader title="Gender-Typical Pitch Ranges" icon={Target} section="ranges" color="blue" />
                    {expandedSections.ranges && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Listeners use pitch as one cue for gender perception. Research has identified
                                approximate thresholds where perception tends to shift:
                            </p>

                            <DataTable
                                headers={['Classification', 'Frequency Range', 'Notes']}
                                rows={pitchRanges}
                                highlightFirst
                            />

                            <NoteBox type="tip">
                                <strong>180 Hz</strong> is often cited as the target for consistent feminine perception,
                                but remember: pitch is just one factor. A voice at 160 Hz with excellent resonance
                                may be perceived as more feminine than a voice at 200 Hz with chest resonance.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                The <strong className="text-white">androgynous zone (135-175 Hz)</strong> is particularly
                                interesting. In this range, other cues like resonance, intonation, and speech patterns
                                have a larger influence on gender perception.
                            </p>
                        </div>
                    )}
                </section>

                {/* Training Section */}
                <section>
                    <SectionHeader title="Training Your Pitch" icon={TrendingUp} section="training" color="purple" />
                    {expandedSections.training && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Pitch training follows a progressive approach. The goal is to establish a new
                                habitual speaking pitch that feels comfortable and sustainable.
                            </p>

                            <h3 className="text-lg font-semibold text-white mb-3">Progression Milestones</h3>
                            <DataTable
                                headers={['Stage', 'Target F0', 'Description']}
                                rows={milestones}
                                highlightFirst
                            />

                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Common Exercises</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-cyan-300 mb-1">Pitch Glides (Sirens)</h4>
                                    <p className="text-sm text-slate-400">
                                        Start at your lowest comfortable pitch, glide smoothly to your highest,
                                        then back down. Use &quot;ee&quot; or &quot;oo&quot; vowels. This expands your comfortable range.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-cyan-300 mb-1">Pitch Targeting</h4>
                                    <p className="text-sm text-slate-400">
                                        Use a reference tone (app or keyboard) at your target pitch. Match it with
                                        a sustained &quot;ah,&quot; then practice phrases while returning to this &quot;home base.&quot;
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-cyan-300 mb-1">Straw Phonation</h4>
                                    <p className="text-sm text-slate-400">
                                        Phonating through a narrow straw builds efficient voice production and
                                        helps maintain pitch with less effort and strain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Health Section */}
                <section>
                    <SectionHeader title="Vocal Health Considerations" icon={Info} section="health" color="emerald" />
                    {expandedSections.health && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <NoteBox type="warning">
                                <strong>Pain is a signal to stop.</strong> Voice training should never cause pain
                                or discomfort. If you experience throat pain, hoarseness lasting more than 2 weeks,
                                or voice loss, please see an ENT specialist or speech-language pathologist.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                Safe pitch training involves:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li>Gradual increases rather than forcing high pitches immediately</li>
                                <li>Regular rest periods during practice sessions</li>
                                <li>Proper breath support from the diaphragm</li>
                                <li>Staying hydrated before and during practice</li>
                                <li>Warming up before intensive exercises</li>
                                <li>Cooling down after sessions with descending glides</li>
                            </ul>

                            <p className="text-slate-300 leading-relaxed mt-4">
                                <strong className="text-white">Signs of strain</strong> to watch for:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li>Throat tightness or fatigue after short practice</li>
                                <li>Pitch becoming unstable or &quot;cracking&quot;</li>
                                <li>Increasing effort required to maintain pitch</li>
                                <li>Voice feeling &quot;tired&quot; the next day</li>
                            </ul>
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
                        <li>Gelfer, M. P., & Schofield, K. J. (2000). Comparison of acoustic and perceptual measures of voice in male-to-female transsexuals perceived as female versus those perceived as male.</li>
                        <li>Spencer, L. E. (1988). Speech characteristics of male-to-female transsexuals: A perceptual and acoustic study.</li>
                        <li>Dacakis, G. (2002). The role of voice therapy in male-to-female transsexuals.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default PitchInfoView;
