import { useState } from 'react';
import { Waves, ChevronDown, ChevronUp, ExternalLink, Info, Activity, Heart } from 'lucide-react';

/**
 * VoiceQualityInfoView - Educational article about voice quality and timbre
 */
const VoiceQualityInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        phonation: true,
        metrics: true,
        health: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const qualityMetrics = [
        { metric: 'HNR (Harmonics-to-Noise Ratio)', healthy: '≥20 dB', concerning: '<12 dB', meaning: 'Clarity of voice' },
        { metric: 'Jitter (local)', healthy: '<1.04%', concerning: '>1.5%', meaning: 'Pitch stability' },
        { metric: 'Shimmer (local)', healthy: '3-7%', concerning: '>10%', meaning: 'Amplitude stability' },
        { metric: 'H1-H2 (Spectral tilt)', healthy: 'Variable', concerning: 'N/A', meaning: 'Breathy vs pressed quality' }
    ];

    const SectionHeader = ({ title, icon: Icon, section, color = 'emerald' }) => (
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
                                <td key={j} className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 ? 'font-semibold text-emerald-300' : 'text-slate-300'}`}>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                        <Waves className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Voice Quality & Timbre
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Understanding breathiness, clarity, and indicators of vocal health.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="What is Voice Quality?" icon={Waves} section="general" color="emerald" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Voice quality</strong> (also called <strong className="text-emerald-300">timbre</strong>)
                                describes the overall character of your voice beyond pitch and loudness. It&apos;s
                                what makes your voice sound breathy, clear, rough, or strained.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                Voice quality is primarily determined by how your <strong className="text-white">vocal folds close</strong> during
                                phonation (sound production). Different closure patterns create different sound qualities:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li><strong className="text-emerald-300">Complete closure:</strong> Clear, efficient voice</li>
                                <li><strong className="text-emerald-300">Incomplete closure:</strong> Breathy voice (air escapes)</li>
                                <li><strong className="text-emerald-300">Pressed closure:</strong> Tense, strained voice</li>
                                <li><strong className="text-emerald-300">Irregular closure:</strong> Rough or creaky voice</li>
                            </ul>
                        </div>
                    )}
                </section>

                {/* Phonation Section */}
                <section>
                    <SectionHeader title="Phonation Types & Gender" icon={Activity} section="phonation" color="teal" />
                    {expandedSections.phonation && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Different phonation types have subtle gender associations:
                            </p>

                            <div className="grid md:grid-cols-3 gap-4 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-emerald-300 mb-2">Breathy</h4>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Incomplete vocal fold closure. Air escapes during phonation.
                                    </p>
                                    <p className="text-xs text-emerald-400">
                                        Slightly more common in feminine voices
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-teal-300 mb-2">Modal</h4>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Normal, efficient phonation. Complete but not pressed closure.
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Gender neutral, healthy baseline
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-cyan-300 mb-2">Creaky (Vocal Fry)</h4>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Very low pitch, irregular vocal fold vibration.
                                    </p>
                                    <p className="text-xs text-amber-400">
                                        More associated with masculine voices
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="info">
                                <strong>H1-H2 (Spectral Tilt):</strong> This acoustic measure captures the
                                breathiness/clarity spectrum. Higher H1-H2 values indicate more breathiness.
                                Female voices typically show slightly higher spectral tilt (more breathy quality)
                                than male voices.
                            </NoteBox>

                            <NoteBox type="warning">
                                While mild breathiness can sound feminine, excessive breathiness may indicate
                                incomplete vocal fold closure that should be addressed. Very low H1-H2 (pressed voice)
                                can indicate strain.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Metrics Section */}
                <section>
                    <SectionHeader title="Voice Quality Metrics" icon={Activity} section="metrics" color="blue" />
                    {expandedSections.metrics && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Vocal GEM measures several acoustic parameters to assess voice quality and health:
                            </p>

                            <DataTable
                                headers={['Metric', 'Healthy Range', 'Concerning', 'Meaning']}
                                rows={qualityMetrics}
                            />

                            <div className="space-y-4 mt-6">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-emerald-300 mb-2">HNR (Harmonics-to-Noise Ratio)</h4>
                                    <p className="text-sm text-slate-400">
                                        Measures how &quot;clean&quot; your voice sounds. Higher values mean more harmonic
                                        (periodic) sound relative to noise. Female voices typically have slightly
                                        higher HNR. Values below 12 dB may indicate pathology.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-emerald-300 mb-2">Jitter</h4>
                                    <p className="text-sm text-slate-400">
                                        Measures cycle-to-cycle variation in pitch. Small variations are normal,
                                        but elevated jitter suggests vocal fatigue or instability. Monitor this
                                        during practice sessions.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-emerald-300 mb-2">Shimmer</h4>
                                    <p className="text-sm text-slate-400">
                                        Measures cycle-to-cycle variation in amplitude (loudness). Like jitter,
                                        elevated shimmer can indicate fatigue or strain. Both increase with
                                        prolonged voice use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Health Section */}
                <section>
                    <SectionHeader title="Voice Quality & Health" icon={Heart} section="health" color="rose" />
                    {expandedSections.health && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Voice quality metrics serve as important indicators of vocal health during training:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Signs of Healthy Practice</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• HNR remains stable or high</li>
                                        <li>• Jitter/shimmer stay low</li>
                                        <li>• Voice feels easy and comfortable</li>
                                        <li>• Endurance improves over time</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-amber-900/20 rounded-xl border border-amber-500/30">
                                    <h4 className="font-bold text-amber-300 mb-2">Warning Signs</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• HNR declining during session</li>
                                        <li>• Jitter/shimmer increasing</li>
                                        <li>• Voice feeling tired or strained</li>
                                        <li>• Needing more effort for same sound</li>
                                    </ul>
                                </div>
                            </div>

                            <NoteBox type="warning">
                                <strong>When to stop:</strong> If HNR drops below 12 dB, jitter exceeds 1.5%, or
                                shimmer exceeds 10%, take a break. These patterns suggest vocal fatigue. If you
                                experience pain, stop immediately and consider seeing a voice professional.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Recovery tips:</strong>
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                <li>Straw phonation (SOVT exercises) can help reset vocal fold function</li>
                                <li>Hydration supports vocal fold health</li>
                                <li>Voice rest is restorative—take breaks</li>
                                <li>Gentle humming can be more efficient than speaking</li>
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
                        <li>Titze, I. R. (1995). Workshop on acoustic voice analysis: Summary statement.</li>
                        <li>Boersma, P. (1993). Accurate short-term analysis of the fundamental frequency and the harmonics-to-noise ratio of a sampled sound.</li>
                        <li>Hillenbrand, J. (1988). Perception of aperiodicities in synthetically generated voices.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default VoiceQualityInfoView;
