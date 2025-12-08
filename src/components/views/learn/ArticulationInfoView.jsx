import { useState } from 'react';
import { Languages, ChevronDown, ChevronUp, ExternalLink, Info, Circle, Type } from 'lucide-react';

/**
 * ArticulationInfoView - Educational article about articulation and speech
 */
const ArticulationInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        vowels: true,
        consonants: true,
        gender: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const vowelChart = [
        { vowel: '/i/ (heed)', tongue: 'High front', lip: 'Spread', f1: 'Low (270-430 Hz)', f2: 'High (2290-2760 Hz)' },
        { vowel: '/æ/ (had)', tongue: 'Low front', lip: 'Neutral', f1: 'High (660-860 Hz)', f2: 'Mid (1720-2050 Hz)' },
        { vowel: '/ɑ/ (hot)', tongue: 'Low back', lip: 'Open', f1: 'High (730-850 Hz)', f2: 'Low (1090-1220 Hz)' },
        { vowel: '/u/ (who)', tongue: 'High back', lip: 'Rounded', f1: 'Low (300-370 Hz)', f2: 'Low (870-950 Hz)' }
    ];

    const SectionHeader = ({ title, icon: Icon, section, color = 'amber' }) => (
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
                                <td key={j} className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 ? 'font-semibold text-amber-300' : 'text-slate-300'}`}>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                        <Languages className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                            Articulation & Speech
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Vowel formation, consonant clarity, and speech patterns.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="What is Articulation?" icon={Languages} section="general" color="amber" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Articulation</strong> refers to how we use our
                                <strong className="text-amber-300"> articulators</strong>—tongue, lips, jaw, and soft palate—
                                to shape sounds into recognizable speech. While resonance is about the spaces,
                                articulation is about the movements.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                Articulation affects:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li><strong className="text-amber-300">Speech clarity:</strong> How well others understand you</li>
                                <li><strong className="text-amber-300">Vowel quality:</strong> The specific sound of each vowel</li>
                                <li><strong className="text-amber-300">Consonant precision:</strong> Crisp vs soft sounds</li>
                                <li><strong className="text-amber-300">Formant frequencies:</strong> Tongue position directly affects F2</li>
                            </ul>
                        </div>
                    )}
                </section>

                {/* Vowels Section */}
                <section>
                    <SectionHeader title="The Vowel Space" icon={Circle} section="vowels" color="orange" />
                    {expandedSections.vowels && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Vowels are produced with an open vocal tract—no obstruction of airflow. They&apos;re
                                distinguished primarily by <strong className="text-white">tongue position</strong> and
                                <strong className="text-white"> lip shape</strong>.
                            </p>

                            <div className="my-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <h4 className="font-bold text-orange-300 mb-3">The Vowel Quadrilateral</h4>
                                <p className="text-sm text-slate-400 mb-3">
                                    Vowels are often visualized on a chart based on tongue position:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="p-2 bg-slate-700/50 rounded text-center">
                                        <span className="text-amber-300">High Front</span>
                                        <br />
                                        <span className="text-slate-400">/i/ (heed)</span>
                                    </div>
                                    <div className="p-2 bg-slate-700/50 rounded text-center">
                                        <span className="text-amber-300">High Back</span>
                                        <br />
                                        <span className="text-slate-400">/u/ (who)</span>
                                    </div>
                                    <div className="p-2 bg-slate-700/50 rounded text-center">
                                        <span className="text-amber-300">Low Front</span>
                                        <br />
                                        <span className="text-slate-400">/æ/ (had)</span>
                                    </div>
                                    <div className="p-2 bg-slate-700/50 rounded text-center">
                                        <span className="text-amber-300">Low Back</span>
                                        <br />
                                        <span className="text-slate-400">/ɑ/ (hot)</span>
                                    </div>
                                </div>
                            </div>

                            <DataTable
                                headers={['Vowel', 'Tongue Position', 'Lip Shape', 'Typical F1', 'Typical F2']}
                                rows={vowelChart}
                            />

                            <NoteBox type="tip">
                                <strong>Key insight:</strong> F2 is primarily controlled by tongue position (front/back).
                                Higher F2 values (associated with feminine perception) come from more fronted tongue
                                positions. This is why practicing with front vowels like /i/ and /e/ can help
                                develop forward resonance.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Consonants Section */}
                <section>
                    <SectionHeader title="Consonant Production" icon={Type} section="consonants" color="red" />
                    {expandedSections.consonants && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Consonants are produced by obstructing airflow in various ways. Unlike vowels,
                                they&apos;re categorized by:
                            </p>

                            <div className="grid md:grid-cols-3 gap-4 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-amber-300 mb-2">Place</h4>
                                    <p className="text-sm text-slate-400">
                                        Where the obstruction occurs:
                                    </p>
                                    <ul className="text-xs text-slate-500 mt-2 space-y-1">
                                        <li>• Bilabial: /p/, /b/, /m/</li>
                                        <li>• Alveolar: /t/, /d/, /n/</li>
                                        <li>• Velar: /k/, /g/</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-orange-300 mb-2">Manner</h4>
                                    <p className="text-sm text-slate-400">
                                        How airflow is obstructed:
                                    </p>
                                    <ul className="text-xs text-slate-500 mt-2 space-y-1">
                                        <li>• Stop: /p/, /t/, /k/</li>
                                        <li>• Fricative: /s/, /f/, /sh/</li>
                                        <li>• Nasal: /m/, /n/</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-red-300 mb-2">Voicing</h4>
                                    <p className="text-sm text-slate-400">
                                        Whether vocal folds vibrate:
                                    </p>
                                    <ul className="text-xs text-slate-500 mt-2 space-y-1">
                                        <li>• Voiced: /b/, /d/, /z/</li>
                                        <li>• Voiceless: /p/, /t/, /s/</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
                                <h4 className="font-bold text-amber-300 mb-2">Sibilants and Gender Perception</h4>
                                <p className="text-sm text-slate-400">
                                    Sibilant sounds (/s/, /z/, /sh/, /zh/) can be particularly relevant for
                                    gender perception. The <strong className="text-white">spectral centroid</strong> of
                                    /s/ sounds tends to be higher in feminine voices (around 6000+ Hz) compared to
                                    masculine voices. Vocal GEM measures this as part of articulation analysis.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Gender Section */}
                <section>
                    <SectionHeader title="Articulation & Gender" icon={Languages} section="gender" color="purple" />
                    {expandedSections.gender && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Several articulation patterns show gender-related tendencies:
                            </p>

                            <div className="space-y-3">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-amber-300 mb-1">Vowel Space Size</h4>
                                    <p className="text-sm text-slate-400">
                                        Women tend to use a larger &quot;vowel space&quot;—their vowels are more distinct
                                        from each other, with more extreme tongue positions. This results in
                                        clearer vowel distinctions.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-amber-300 mb-1">Tongue Fronting</h4>
                                    <p className="text-sm text-slate-400">
                                        A more forward tongue position raises F2, which is strongly associated
                                        with feminine perception. This is one of the most trainable aspects of
                                        voice feminization.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-amber-300 mb-1">Sibilant Clarity</h4>
                                    <p className="text-sm text-slate-400">
                                        Higher-frequency /s/ sounds (brighter, sharper) are more associated with
                                        feminine speech. This relates to smaller oral cavity and more anterior
                                        tongue placement.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-amber-300 mb-1">Precision vs Reduction</h4>
                                    <p className="text-sm text-slate-400">
                                        More precise articulation (clearer consonants, less vowel reduction) is
                                        sometimes associated with feminine speech patterns, though this varies
                                        significantly by dialect and speaking context.
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="info">
                                These patterns are tendencies, not rules. Many factors—accent, dialect,
                                individual variation—affect articulation. The goal is awareness, not rigid conformity.
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
                        <li>Hillenbrand, J., et al. (1995). Acoustic characteristics of American English vowels.</li>
                        <li>Peterson, G. E., & Barney, H. L. (1952). Control methods used in a study of the vowels.</li>
                        <li>Zimman, L. (2017). Variability in /s/ among transgender speakers: Evidence for a socially grounded account of gender and sibilants.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default ArticulationInfoView;
