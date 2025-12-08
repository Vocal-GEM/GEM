import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Info, Server, Mic, Brain } from 'lucide-react';

/**
 * FormantsInfoView - Educational article about vocal formants
 * 
 * Covers:
 * - What formants are
 * - How they're measured
 * - How anatomy influences them
 * - Their impact on perceived gender
 * - How the app measures formants
 */
const FormantsInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        measurement: true,
        anatomy: true,
        gender: true,
        technical: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Frequency ranges table data
    const frequencyRanges = [
        { measurement: 'F0 / pitch', range: '75 - 500' },
        { measurement: 'F1', range: '270 - 900' },
        { measurement: 'F2', range: '900 - 2800' },
        { measurement: 'F3', range: '2300 - 3400' }
    ];

    // F1 effects table
    const f1Effects = [
        { component: 'Larynx position', effect: 'Lowering the larynx lowers F1, raising it increases F1' },
        { component: 'Pharynx length', effect: 'A bigger pharynx lowers F1, a smaller pharynx raises F1' },
        { component: 'Tongue position', effect: 'A high tongue position lowers F1, a low tongue raises F1' },
        { component: 'Lip rounding', effect: 'Lowers F1, but less pronounced compared to F2 and F3' },
        { component: 'Jaw', effect: 'Raising the jaw lowers F1, lowering the jaw raises F1' }
    ];

    // F2 effects table
    const f2Effects = [
        { component: 'Larynx position', effect: 'Lowering the larynx lowers F2, raising it increases F2' },
        { component: 'Pharynx length', effect: 'A bigger pharynx lowers F2, a smaller pharynx raises F2' },
        { component: 'Tongue position', effect: 'A front tongue position raises F2, a back tongue lowers F2' },
        { component: 'Lip rounding', effect: 'Significantly lowers F2' },
        { component: 'Jaw', effect: 'Minimal direct effect, but interacts with tongue position' }
    ];

    // F3 effects table
    const f3Effects = [
        { component: 'Larynx position', effect: 'Lowering the larynx lowers F3, raising it increases F3' },
        { component: 'Pharynx length', effect: 'A bigger pharynx lowers F3, a smaller pharynx raises F3' },
        { component: 'Tongue position', effect: 'Subtle effects, often linked to vowel type (e.g., roundedness)' },
        { component: 'Lip rounding', effect: 'Lowers F3' },
        { component: 'Jaw', effect: 'Minimal direct effect' }
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
                                    className={`px-4 py-3 text-sm border-b border-slate-800/50 ${j === 0 && highlightFirst
                                        ? 'font-semibold text-purple-300'
                                        : 'text-slate-300'
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

    const ImageFigure = ({ src, alt, caption }) => (
        <figure className="my-6">
            <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto"
                    loading="lazy"
                />
            </div>
            {caption && (
                <figcaption className="mt-2 text-sm text-slate-400 text-center italic">
                    {caption}
                </figcaption>
            )}
        </figure>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                        <BookOpen className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                            What are Vocal Formants?
                        </h1>
                        <p className="text-slate-400 mt-1">
                            An introduction to vocal formants, how they are measured, and their impact on perceived gender.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Section */}
                <section>
                    <SectionHeader title="General" icon={BookOpen} section="general" color="purple" />
                    {expandedSections.general && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Formants are the <strong className="text-white">resonant frequencies of the vocal tract</strong>.
                                They are created by the shape and size of the vocal tract, which can be altered by changing
                                the position of the larynx, tongue, lips, and other articulators.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                Formants play a crucial role in speech production and are responsible for the
                                <strong className="text-purple-300"> unique timbre and quality</strong> of each person&apos;s voice.
                                Formants also play a primary role in the <strong className="text-purple-300">perceived gender</strong> of someone&apos;s voice.
                            </p>
                            <NoteBox type="info">
                                Please see the references at the end of this article for more information on formants
                                and their role in speech production.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Measurement Section */}
                <section>
                    <SectionHeader title="How are formants measured?" icon={Mic} section="measurement" color="blue" />
                    {expandedSections.measurement && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Formants are typically measured using <strong className="text-white">acoustic analysis of recorded speech</strong>.
                                The first three formants, denoted as <strong className="text-blue-300">F1</strong>,
                                <strong className="text-purple-300"> F2</strong>, and <strong className="text-pink-300">F3</strong>,
                                are the most important for speech perception.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                These formants correspond to specific resonant frequencies of the vocal tract, which are
                                influenced by the shape and size of the vocal tract. It is worth noting that pitch, while
                                not a formant, is also an important acoustic feature of the voice and is often denoted as
                                <strong className="text-cyan-300"> F0</strong>.
                            </p>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Approximate Frequency Ranges
                                </h3>
                                <p className="text-sm text-slate-400 mb-3">
                                    These ranges can vary depending on the individual, age, gender, and what&apos;s being spoken.
                                </p>
                                <DataTable
                                    headers={['Measurement', 'Approximate Frequency Range (Hz)']}
                                    rows={frequencyRanges}
                                    highlightFirst
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Source: Static Measurements of Vowel Formant Frequencies and Bandwidths: A Review
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Anatomy Section */}
                <section>
                    <SectionHeader title="How are formants influenced by your anatomy?" icon={Brain} section="anatomy" color="emerald" />
                    {expandedSections.anatomy && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-6">
                            <NoteBox type="warning">
                                <strong>Important!</strong> How your anatomy and vocal tract shape can affect each formant
                                is a complex topic. The following section is a simplification and does not cover all factors
                                that can influence formants.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                The diagram below highlights the major anatomical components that influence your speech production.
                                One of the first steps in voice training is understanding each component, how they contribute to
                                your voice, and learning how to control the ones that influence the perceived gender of your voice.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                That last part can be tricky because most components are controlled subconsciously.
                            </p>

                            <p className="text-slate-300 leading-relaxed">
                                Unlike pitch, which is controlled almost entirely by the length and tightness of the vocal folds,
                                how your anatomy influences formants is more complex. Here are some general guidelines on how you
                                can change your formants:
                            </p>

                            {/* F1 Effects Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                    Effect on F1
                                </h3>
                                <DataTable
                                    headers={['Component', 'Effect on F1']}
                                    rows={f1Effects}
                                    highlightFirst
                                />
                            </div>

                            {/* F2 Effects Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                                    Effect on F2
                                </h3>
                                <DataTable
                                    headers={['Component', 'Effect on F2']}
                                    rows={f2Effects}
                                    highlightFirst
                                />
                            </div>

                            {/* F3 Effects Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-pink-300 mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-pink-400"></span>
                                    Effect on F3
                                </h3>
                                <DataTable
                                    headers={['Component', 'Effect on F3']}
                                    rows={f3Effects}
                                    highlightFirst
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* Gender Perception Section */}
                <section>
                    <SectionHeader title="How do formants impact your perceived gender?" icon={Mic} section="gender" color="pink" />
                    {expandedSections.gender && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Formants significantly influence how others perceive your gender based on your voice.
                                The first two formants, <strong className="text-blue-300">F1</strong> and
                                <strong className="text-purple-300"> F2</strong>, are particularly important.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                For instance, a <strong className="text-white">lower F1 frequency</strong> is often associated
                                with a larger vocal tract, which typically corresponds to a deeper, more &quot;masculine&quot; voice.
                                Conversely, a <strong className="text-white">higher F1 frequency</strong> can give the impression
                                of a smaller vocal tract and a higher-pitched, more &quot;feminine&quot; voice.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                However, while the values of F1, F2, and F3 are generally lower in men compared to women,
                                their value is also impacted by the words being spoken. Speech researchers often analyze
                                formants in the context of vowels, as different vowels have different formant frequencies.
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                                For example, the F2 formant of the sound <strong className="text-cyan-300">&quot;ee&quot;</strong> is
                                higher than the sound <strong className="text-cyan-300">&quot;ah&quot;</strong>, which is expected because
                                the position of the tongue and jaw lead to a larger vocal tract when you say &quot;ah&quot; compared to &quot;ee&quot;.
                            </p>

                            <ImageFigure
                                src="/formants-ee-ah-graph.png"
                                alt="Formant frequencies when saying 'ee' and 'ah' sounds"
                                caption="Example screenshot of the formants when saying 'ee' and 'ah'. Notice how F2 (purple) is higher for 'ee' sounds."
                            />

                            <p className="text-slate-300 leading-relaxed">
                                To provide a more comprehensive view, the figure below visualizes the average values for
                                F1 and F2 in men and women for different vowels.
                            </p>

                            <ImageFigure
                                src="/formants-vowel-space-gender.png"
                                alt="F1 vs F2 vowel space plot showing gender differences"
                                caption="Average F1 and F2 values for different vowels in men (purple triangles) and women (red plus signs). Source: arxiv.org/abs/2206.11632"
                            />
                        </div>
                    )}
                </section>

                {/* Technical Section */}
                <section>
                    <SectionHeader title="How Vocal GEM measures formants" icon={Server} section="technical" color="cyan" />
                    {expandedSections.technical && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Vocal GEM uses an <strong className="text-white">AI-based algorithm</strong> to analyze
                                the formants in your voice recordings. We use an open source algorithm called
                                <strong className="text-cyan-300"> FormantsTracker</strong>.
                            </p>

                            <ImageFigure
                                src="/formants-server-architecture.png"
                                alt="Server architecture diagram showing audio processing flow"
                                caption="Audio is sent to our servers for formant analysis and the results are returned to your device."
                            />

                            <p className="text-slate-300 leading-relaxed">
                                Given the computational complexity of formant analysis, this process is too resource-intensive
                                to be performed on most user devices. Instead, when you record your voice, the audio is
                                <strong className="text-white"> securely sent to our backend servers</strong>. There, it is
                                processed using the algorithm and the results are sent back to your device.
                            </p>

                            <NoteBox type="info">
                                <strong>Privacy Note:</strong> Your audio data is encrypted during transmission and is not
                                stored permanently on our servers. We are actively working on on-device processing to
                                enhance user privacy in future updates.
                            </NoteBox>

                            <ImageFigure
                                src="/formants-analysis-example.png"
                                alt="Example formant analysis showing pitch and formant graphs"
                                caption="Example formant analysis. The top graph shows pitch, and the bottom graph shows F1 (black), F2 (purple), and F3 (pink)."
                            />

                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <h4 className="font-semibold text-white mb-2">Device Compatibility</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    We understand that not all devices are capable of performing gender estimation due to
                                    device or software limitations. To address this, we&apos;ve introduced an optional feature
                                    where users can now choose to stream their audio to our backend for gender estimation.
                                </p>
                                <ImageFigure
                                    src="/formants-server-modal.png"
                                    alt="Server streaming permission modal"
                                    caption="If your device cannot handle local processing, you'll see this prompt."
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* References Section */}
                <section className="mt-8 p-6 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-slate-400" />
                        References
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
                        <li>The Voice Foundation - Anatomy of Voice Production</li>
                        <li>Titze, I.R. (2000). Principles of Voice Production</li>
                        <li>Static Measurements of Vowel Formant Frequencies and Bandwidths: A Review</li>
                        <li>
                            Formant Analysis for Gender Perception -
                            <a
                                href="https://arxiv.org/abs/2206.11632"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 ml-1 underline"
                            >
                                arxiv.org/abs/2206.11632
                            </a>
                        </li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default FormantsInfoView;
