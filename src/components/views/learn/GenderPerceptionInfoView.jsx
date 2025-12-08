import { useState } from 'react';
import { Users, ChevronDown, ChevronUp, ExternalLink, Info, Target, Lightbulb } from 'lucide-react';

/**
 * GenderPerceptionInfoView - Educational article about voice gender perception
 */
const GenderPerceptionInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        cues: true,
        research: true,
        goals: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const cueImportance = [
        { cue: 'Average Pitch (F0)', importance: '★★★★★', notes: 'Strong predictor, but not sufficient alone' },
        { cue: 'Formants/Resonance', importance: '★★★★★', notes: 'May be more important than pitch for some listeners' },
        { cue: 'Intonation Patterns', importance: '★★★★☆', notes: 'Especially important in androgynous pitch range' },
        { cue: 'Voice Quality', importance: '★★★☆☆', notes: 'Breathiness, H1-H2, spectral tilt' },
        { cue: 'Articulation', importance: '★★★☆☆', notes: 'Sibilant frequency, vowel space' },
        { cue: 'Speech Rate/Rhythm', importance: '★★☆☆☆', notes: 'Less consistent findings' }
    ];

    const SectionHeader = ({ title, icon: Icon, section, color = 'violet' }) => (
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
                                <td key={j} className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 ? 'font-semibold text-violet-300' : 'text-slate-300'}`}>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                        <Users className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                            Gender Perception
                        </h1>
                        <p className="text-slate-400 mt-1">
                            How listeners perceive voice gender and what research tells us.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="How We Perceive Voice Gender" icon={Users} section="general" color="violet" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                When we hear a voice, our brains quickly and often unconsciously make
                                judgments about the speaker—including their perceived gender. This
                                perception is based on <strong className="text-white">multiple acoustic cues</strong>
                                rather than any single feature.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                Think of gender perception as a <strong className="text-violet-300">weighted combination</strong>
                                of many signals. If enough cues point toward feminine perception, the
                                overall impression is feminine—even if individual cues might not be.
                            </p>

                            <NoteBox type="info">
                                <strong>Key insight:</strong> There is no single &quot;switch&quot; that makes a
                                voice sound masculine or feminine. It&apos;s always a combination of factors,
                                and different listeners may weight these factors differently based on
                                their own experiences and expectations.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                This is actually <strong className="text-white">good news</strong> for voice
                                training: you don&apos;t need to achieve &quot;perfect&quot; feminine values on
                                every measure. Improving several factors together can shift overall
                                perception even if individual measures aren&apos;t extreme.
                            </p>
                        </div>
                    )}
                </section>

                {/* Cues Section */}
                <section>
                    <SectionHeader title="The Acoustic Cues" icon={Target} section="cues" color="purple" />
                    {expandedSections.cues && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Research has identified several acoustic features that contribute to
                                gender perception:
                            </p>

                            <DataTable
                                headers={['Acoustic Cue', 'Importance', 'Notes']}
                                rows={cueImportance}
                            />

                            <div className="grid md:grid-cols-2 gap-4 my-6">
                                <div className="p-4 bg-violet-900/20 rounded-xl border border-violet-500/30">
                                    <h4 className="font-bold text-violet-300 mb-2">Primary Cues</h4>
                                    <ul className="text-sm text-slate-300 space-y-2">
                                        <li>
                                            <strong>Pitch:</strong> Higher average F0 is associated with
                                            feminine perception. Target: &gt;165-180 Hz for consistent shift.
                                        </li>
                                        <li>
                                            <strong>Resonance:</strong> Higher formants (especially F2)
                                            signal a smaller vocal tract, associated with feminine perception.
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                                    <h4 className="font-bold text-purple-300 mb-2">Secondary Cues</h4>
                                    <ul className="text-sm text-slate-300 space-y-2">
                                        <li>
                                            <strong>Intonation:</strong> More varied, melodic patterns
                                            lean feminine. Flatter delivery leans masculine.
                                        </li>
                                        <li>
                                            <strong>Voice quality:</strong> Slight breathiness (higher H1-H2)
                                            is more common in feminine voices.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <NoteBox type="tip">
                                <strong>The synergy effect:</strong> When pitch is in the androgynous
                                range (135-175 Hz), other cues become more influential. A voice at
                                160 Hz with excellent resonance and intonation may be perceived as
                                more feminine than a voice at 200 Hz with masculine resonance patterns.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Research Section */}
                <section>
                    <SectionHeader title="What Research Shows" icon={Lightbulb} section="research" color="fuchsia" />
                    {expandedSections.research && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Decades of research have refined our understanding of voice gender perception:
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-fuchsia-300 mb-2">Pitch Thresholds</h4>
                                    <p className="text-sm text-slate-400">
                                        Studies consistently find that voices above ~165-180 Hz begin to be
                                        perceived as feminine, with strong consensus around 180 Hz as a reliable
                                        threshold. However, pitch alone accounts for only about 50-60% of
                                        gender perception.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-fuchsia-300 mb-2">Resonance Importance</h4>
                                    <p className="text-sm text-slate-400">
                                        Multiple studies show that formant frequencies (especially the combination
                                        of F1 and F2) predict gender perception as well as or better than pitch
                                        alone. Average formant frequency ~15-20% higher shifts perception feminine.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-fuchsia-300 mb-2">Training Outcomes</h4>
                                    <p className="text-sm text-slate-400">
                                        Research on trans voice training shows that combined training of pitch,
                                        resonance, and intonation leads to better perception outcomes than
                                        focusing on pitch alone. Most participants can achieve consistent
                                        feminine perception with dedicated practice.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-fuchsia-300 mb-2">Listener Variation</h4>
                                    <p className="text-sm text-slate-400">
                                        Different listeners may perceive the same voice differently. Factors
                                        include the listener&apos;s language background, expectations, and individual
                                        weighting of acoustic cues. This is normal and expected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Goals Section */}
                <section>
                    <SectionHeader title="Setting Realistic Goals" icon={Target} section="goals" color="emerald" />
                    {expandedSections.goals && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Understanding perception research can help you set meaningful training goals:
                            </p>

                            <div className="space-y-3">
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Focus on the combination</h4>
                                    <p className="text-sm text-slate-400">
                                        Rather than obsessing over any single metric, work on improving
                                        pitch, resonance, and intonation together. The synergy between
                                        these creates a more natural and consistent result.
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Find your sustainable range</h4>
                                    <p className="text-sm text-slate-400">
                                        The &quot;best&quot; voice is one you can use comfortably all day.
                                        Pushing for extremely high pitch or unnatural postures can cause
                                        strain. Aim for a voice that feels authentic and sustainable.
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Remember individual variation</h4>
                                    <p className="text-sm text-slate-400">
                                        Cisgender women&apos;s voices vary enormously—from alto ranges to
                                        soprano, from resonant to breathy, from melodic to monotone.
                                        There&apos;s no single &quot;correct&quot; feminine voice to aim for.
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Celebrate progress</h4>
                                    <p className="text-sm text-slate-400">
                                        Voice training is a journey. Small improvements compound over time.
                                        Track your progress and celebrate milestones, even when the end
                                        goal feels far away.
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="tip">
                                <strong>Your voice, your goals:</strong> Not everyone wants the same thing.
                                Some want consistent feminine perception; others want an androgynous
                                voice; still others want flexibility for different contexts. Define
                                what success means <em>for you</em>.
                            </NoteBox>
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
                        <li>Gelfer, M. P., & Schofield, K. J. (2000). Comparison of acoustic and perceptual measures of voice in male-to-female transsexuals.</li>
                        <li>Hancock, A. B., Krissinger, J., & Owen, K. (2011). Voice perceptions and quality of life of transgender people.</li>
                        <li>Davies, S., & Goldberg, J. (2006). Trans Care: Voice and communication therapy for transgender men and women.</li>
                        <li>Hardy, T. L. D., et al. (2020). The ICF and the acoustic voice: A systematic review.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default GenderPerceptionInfoView;
