import { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, ExternalLink, Info, Waves, Wind } from 'lucide-react';

/**
 * VocalAnatomyInfoView - Educational article about vocal anatomy
 */
const VocalAnatomyInfoView = () => {
    const [expandedSections, setExpandedSections] = useState({
        folds: true,
        tract: true,
        control: true,
        changes: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const SectionHeader = ({ title, icon: Icon, section, color = 'rose' }) => (
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30">
                        <Heart className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-red-400">
                            Vocal Anatomy
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Understanding your instrument: the vocal folds, larynx, and vocal tract.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Vocal Folds Section */}
                <section>
                    <SectionHeader title="The Vocal Folds" icon={Waves} section="folds" color="rose" />
                    {expandedSections.folds && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                The <strong className="text-white">vocal folds</strong> (also called vocal cords) are
                                two bands of muscle tissue located in your <strong className="text-rose-300">larynx</strong> (voice box).
                                When you speak or sing, air from your lungs causes these folds to vibrate,
                                producing sound.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-rose-300 mb-2">Structure</h4>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• Made of muscle (thyroarytenoid), ligament, and mucosa</li>
                                        <li>• Stretch from front (thyroid cartilage) to back (arytenoid cartilages)</li>
                                        <li>• In adults: ~15-25mm long</li>
                                        <li>• Covered by thin, flexible membrane</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-pink-300 mb-2">Function</h4>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• Open during breathing</li>
                                        <li>• Close and vibrate during phonation</li>
                                        <li>• Protect airway during swallowing</li>
                                        <li>• Vibration rate determines pitch</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl border border-rose-500/20">
                                <h4 className="font-bold text-rose-300 mb-2">How Pitch is Controlled</h4>
                                <p className="text-sm text-slate-400 mb-2">
                                    Pitch depends on three main factors of vocal fold mechanics:
                                </p>
                                <ul className="text-sm text-slate-400 space-y-2">
                                    <li>
                                        <strong className="text-white">Length:</strong> Longer folds vibrate slower (lower pitch).
                                        The cricothyroid muscle stretches the folds to increase pitch.
                                    </li>
                                    <li>
                                        <strong className="text-white">Tension:</strong> Tighter folds vibrate faster (higher pitch).
                                        Multiple muscles adjust fold tension.
                                    </li>
                                    <li>
                                        <strong className="text-white">Mass:</strong> Thicker folds vibrate slower.
                                        Testosterone exposure during puberty thickens the folds.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </section>

                {/* Vocal Tract Section */}
                <section>
                    <SectionHeader title="The Vocal Tract" icon={Wind} section="tract" color="purple" />
                    {expandedSections.tract && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                The <strong className="text-white">vocal tract</strong> is the air space extending from the
                                vocal folds to the lips. It includes:
                            </p>

                            <div className="space-y-3 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-purple-300 mb-1">Pharynx (Throat)</h4>
                                    <p className="text-sm text-slate-400">
                                        The tube-shaped cavity behind the mouth and nasal passages. Its size
                                        affects resonance—a larger pharynx creates lower formants, a smaller
                                        one creates higher formants.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-purple-300 mb-1">Oral Cavity (Mouth)</h4>
                                    <p className="text-sm text-slate-400">
                                        The space in your mouth. Tongue position, jaw opening, and lip shape
                                        all modify this space, significantly affecting vowel quality and formants.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-semibold text-purple-300 mb-1">Nasal Cavity</h4>
                                    <p className="text-sm text-slate-400">
                                        The space in your nose. Opens for nasal sounds (/m/, /n/, /ng/) when
                                        the soft palate lowers. Adds resonance characteristics.
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="info">
                                <strong>Why the vocal tract matters:</strong> The vocal tract acts as a
                                <em> resonating chamber</em>. Just as a guitar body shapes the sound of
                                vibrating strings, your vocal tract shapes the sound from your vocal folds.
                                This is why two people can produce the same pitch but sound completely different.
                            </NoteBox>

                            <p className="text-slate-300 leading-relaxed">
                                <strong className="text-white">Formants</strong> are the resonant frequencies of
                                the vocal tract. Changing the shape of your tract changes your formants,
                                which changes how your voice is perceived.
                            </p>
                        </div>
                    )}
                </section>

                {/* Control Section */}
                <section>
                    <SectionHeader title="What You Can Control" icon={Heart} section="control" color="teal" />
                    {expandedSections.control && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Some aspects of your vocal anatomy are fixed, while others can be modified
                                through training:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                    <h4 className="font-bold text-emerald-300 mb-2">Trainable</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• Larynx position (raised/lowered)</li>
                                        <li>• Tongue position (front/back, high/low)</li>
                                        <li>• Lip position (spread/rounded)</li>
                                        <li>• Soft palate position</li>
                                        <li>• Vocal fold tension</li>
                                        <li>• Breath support</li>
                                        <li>• Phonation patterns</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-slate-400 mb-2">Fixed (without surgery)</h4>
                                    <ul className="text-sm text-slate-400 space-y-1">
                                        <li>• Vocal fold length</li>
                                        <li>• Vocal fold thickness</li>
                                        <li>• Bone structure (jaw, skull)</li>
                                        <li>• Nasal cavity size</li>
                                        <li>• Cartilage size</li>
                                    </ul>
                                </div>
                            </div>

                            <NoteBox type="tip">
                                <strong>Good news:</strong> The trainable aspects are powerful! Larynx position
                                and tongue position alone can shift formants significantly enough to change
                                gender perception. Voice training works by developing control over these
                                moveable structures.
                            </NoteBox>
                        </div>
                    )}
                </section>

                {/* Changes Section */}
                <section>
                    <SectionHeader title="How Hormones Affect Voice" icon={Waves} section="changes" color="amber" />
                    {expandedSections.changes && (
                        <div className="mt-4 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-4">
                            <p className="text-slate-300 leading-relaxed">
                                Hormones can permanently change vocal anatomy, which is why voice training
                                approaches differ based on hormone history:
                            </p>

                            <div className="space-y-4 my-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-amber-300 mb-2">Testosterone Exposure</h4>
                                    <p className="text-sm text-slate-400">
                                        During testosterone-dominant puberty, vocal folds lengthen and thicken
                                        permanently. This lowers the voice by about an octave. These changes
                                        <strong className="text-white"> do not reverse</strong> if testosterone
                                        is later reduced.
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        <strong>For voice feminization:</strong> Since fold changes are permanent,
                                        training focuses on maximizing fold tension (for higher pitch) and
                                        modifying the vocal tract (for higher formants/resonance).
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <h4 className="font-bold text-amber-300 mb-2">Estrogen + Anti-Androgens</h4>
                                    <p className="text-sm text-slate-400">
                                        Estrogen-based HRT <strong className="text-white">does not change
                                            vocal fold structure</strong> in adults. If the voice has already
                                        gone through testosterone-driven changes, estrogen will not reverse them.
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        <strong>Note:</strong> If testosterone is blocked before puberty
                                        (puberty blockers), the voice may not deepen in the first place.
                                    </p>
                                </div>
                            </div>

                            <NoteBox type="warning">
                                <strong>Surgical options:</strong> Procedures like glottoplasty or
                                cricothyroid approximation can modify pitch surgically, but these are
                                separate from hormone therapy and carry their own risks and considerations.
                                Consult with specialized surgeons if interested.
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
                        <li>Titze, I. R. (2000). Principles of Voice Production. National Center for Voice and Speech.</li>
                        <li>The Voice Foundation. Anatomy and Physiology of Voice Production.</li>
                        <li>Adler, R. K., Hirsch, S., & Mordaunt, M. (2012). Voice and Communication Therapy for the Transgender/Transsexual Client.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default VocalAnatomyInfoView;
