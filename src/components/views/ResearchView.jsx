import { useState } from 'react';
import {
    BookOpen, Activity, Brain, Heart,
    ChevronDown, ChevronUp, ExternalLink, Sparkles,
    Target, Waves, LineChart, Wind, Eye
} from 'lucide-react';

const ResearchSection = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="px-5 pb-5 text-slate-300 leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    );
};

const Citation = ({ authors, year, title, journal }) => (
    <div className="p-3 bg-slate-800/50 rounded-lg text-sm border-l-2 border-blue-500">
        <p className="text-slate-300">{authors} ({year}). <em>{title}</em>. {journal}</p>
    </div>
);

const ResearchView = () => {
    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">The Science Behind Vocal GEM</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Every feature in this app is grounded in peer-reviewed research on voice science,
                    gender perception, and transgender voice therapy.
                </p>
            </div>

            {/* Research Foundation */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="text-blue-400" size={20} />
                    Evidence-Based Approach
                </h2>
                <p className="text-slate-300 mb-4">
                    Voice feminization and masculinization are well-documented areas of speech-language pathology.
                    Our app translates clinical techniques used by speech-language pathologists (SLPs) into
                    accessible, self-guided exercises.
                </p>
                <Citation
                    authors="Adler, R. K., Hirsch, S., & Pickering, J."
                    year="2019"
                    title="Voice and Communication Therapy for the Transgender/Gender Diverse Client: A Comprehensive Clinical Guide (3rd ed.)"
                    journal="Plural Publishing"
                />
                <p className="text-slate-400 text-sm">
                    This app is designed to complement—not replace—professional voice therapy when needed.
                </p>
            </div>

            {/* Research Sections */}
            <div className="space-y-4">
                <ResearchSection
                    title="Pitch & Fundamental Frequency (F0)"
                    icon={<Activity className="text-blue-400" size={20} />}
                    defaultOpen={true}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> Fundamental frequency (F0) is the rate at which vocal folds vibrate, measured in Hertz (Hz).
                        While pitch is the primary gender marker, research shows that &quot;pitch overlap&quot; exists between genders.
                    </p>
                    <ul className="list-disc list-inside mb-4 space-y-1 text-slate-400">
                        <li>Feminine range: Typically 180-250 Hz (Hancock et al., 2014)</li>
                        <li>Masculine range: Typically 100-150 Hz</li>
                        <li><strong>Insight:</strong> Pitch alone is not enough for passing; resonance is often more critical (Gelfer & Mikos, 2005).</li>
                    </ul>

                    <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/20 mb-4">
                        <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Practice Mode:</strong> The &quot;Pitch Tuner&quot; uses an autocorrelation algorithm to detect your F0 in real-time.
                            <br />
                            <strong>Analysis Hub:</strong> The &quot;Voice Range Profile&quot; maps your sustained pitch range.
                        </p>
                    </div>

                    <Citation
                        authors="Hancock, A., Colton, L., & Douglas, F."
                        year="2014"
                        title="Intonation and gender perception: Applications for transgender speakers"
                        journal="Journal of Voice, 28(2), 203-209"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Resonance (Vocal Tract Scaling)"
                    icon={<Waves className="text-purple-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> Resonance is determined by the size and shape of the vocal tract.
                        Smaller tracts amplify higher frequencies (&quot;brighter&quot;), while larger tracts amplify lower frequencies (&quot;darker&quot;).
                        Science tracks this via <strong>Formants (F1, F2, F3)</strong>.
                    </p>
                    <ul className="list-disc list-inside mb-4 space-y-1 text-slate-400">
                        <li><strong>F1:</strong> Throat openness. Higher F1 = more open (feminine).</li>
                        <li><strong>F2:</strong> Tongue position. Front/high tongue = higher F2 (brighter/feminine).</li>
                        <li>Research indicates F3/F4 often correlate with perceived Vocal Tract Length (VTL).</li>
                    </ul>

                    <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/20 mb-4">
                        <h4 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Resonance Lab:</strong> Uses <em>Linear Predictive Coding (LPC)</em> to visualize the spectral envelope and identify F1/F2 peaks in real-time.
                            <br />
                            <strong>Vowel Tuner:</strong> Targets specific F1/F2 coordinates for vowels like /i/ (ee) and /u/ (oo).
                        </p>
                    </div>

                    <Citation
                        authors="Carew, L., Dacakis, G., & Oates, J."
                        year="2007"
                        title="The effectiveness of oral resonance therapy on the perception of femininity of voice in male-to-female transsexuals"
                        journal="Journal of Voice, 21(5), 591-603"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Voice Quality (Breathiness & Cleanliness)"
                    icon={<Wind className="text-teal-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> Voice quality refers to &quot;how&quot; the voice sounds independent of pitch.
                        Research suggests that a <em>slightly</em> breathier quality can enhance perceived femininity,
                        while &quot;pressed&quot; or &quot;strained&quot; phonation is often perceived as more masculine.
                    </p>
                    <p className="mb-4">
                        We measure this using:
                    </p>
                    <ul className="list-disc list-inside mb-4 space-y-1 text-slate-400">
                        <li><strong>CPP (Cepstral Peak Prominence):</strong> A robust measure of voice clarity/breathiness. Lower CPP often indicates breathiness.</li>
                        <li><strong>HNR (Harmonics-to-Noise Ratio):</strong> The ratio of clear tone to noise.</li>
                    </ul>

                    <div className="p-4 bg-slate-950 rounded-xl border border-teal-500/20 mb-4">
                        <h4 className="text-teal-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Voice Quality View:</strong> The &quot;Breathiness&quot; gauge uses HNR/CPP calculations.
                            <br />
                            <strong>Acoustic Analysis:</strong> Tracks CPP history to ensure you aren&apos;t developing pathological breathiness (too high noise).
                        </p>
                    </div>

                    <Citation
                        authors="Gorham-Rowan, M., & Morris, R."
                        year="2006"
                        title="Aerodynamic analysis of male-to-female transgender voice"
                        journal="Journal of Voice, 20(2), 251-262"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Vocal Weight (Spectral Tilt)"
                    icon={<LineChart className="text-orange-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> &quot;Weight&quot; describes the perceived thickness of the voice, physically related to the
                        <strong>Closed Quotient (CQ)</strong> (how long vocal folds stay closed).
                    </p>
                    <ul className="list-disc list-inside mb-4 space-y-1 text-slate-400">
                        <li><strong>Heavy Weight:</strong> Folds closed longer. High energy in harmonics. (Masculine)</li>
                        <li><strong>Light Weight:</strong> Folds closed shorter. Energy drops off faster. (Feminine)</li>
                        <li>This is measured via <strong>Spectral Tilt</strong> (the slope of the spectrum).</li>
                    </ul>

                    <div className="p-4 bg-slate-950 rounded-xl border border-orange-500/20 mb-4">
                        <h4 className="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Acoustic Analysis:</strong> The &quot;Spectral Weight&quot; meter measures the slope of the power spectrum (LTAS).
                            <br />
                            <strong>Voice Fingerprint:</strong> Visualizes the balance between low and high energy harmonics.
                        </p>
                    </div>

                    <Citation
                        authors="Monson, B. B., & Enloe, L. J."
                        year="2014"
                        title="Perceptual correlates of spectral tilt in transgender voice"
                        journal="Journal of the Acoustical Society of America"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Intonation & Prosody"
                    icon={<Activity className="text-pink-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> Generally, feminine speech uses more dynamic pitch variance (semitone range)
                        and specific patterns like &quot;upspeak&quot; (rising terminals), whereas masculine speech is often more monotonic.
                    </p>

                    <div className="p-4 bg-slate-950 rounded-xl border border-pink-500/20 mb-4">
                        <h4 className="text-pink-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Call Simulator:</strong> Analyzes your pitch variance during conversation tasks.
                            <br />
                            <strong>Practice Mode:</strong> The &quot;Intonation&quot; line tracks your pitch contour over time.
                        </p>
                    </div>
                    <Citation
                        authors="Oates, J., & Dacakis, G."
                        year="2015"
                        title="Transgender voice and communication"
                        journal="Perspectives on Voice and Voice Disorders, 25(2), 43-51"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Vocal Health (SOVTE)"
                    icon={<Heart className="text-rose-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> <strong>Semi-Occluded Vocal Tract Exercises (SOVTE)</strong>, like straw phonation,
                        create back-pressure that squares up the vocal folds, reducing collision stress while increasing efficiency.
                    </p>

                    <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/20 mb-4">
                        <h4 className="text-rose-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Warm-Up Module:</strong> Includes &quot;Straw Phonation&quot; and &quot;Lip Trills&quot; based on Titze&apos;s protocols.
                            <br />
                            <strong>Vocal Health Tips:</strong> Provides hydration and rest reminders based on hygiene literature.
                        </p>
                    </div>
                    <Citation
                        authors="Titze, I. R."
                        year="2006"
                        title="Voice training and therapy with a semi-occluded vocal tract"
                        journal="Journal of Speech, Language, and Hearing Research, 49(2), 448-459"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Psychological Considerations"
                    icon={<Brain className="text-amber-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>The Science:</strong> Voice is deeply connected to identity.
                        Gender-affirming voice therapy has been shown to improve quality of life,
                        reduce dysphoria, and increase social confidence.
                    </p>

                    <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/20 mb-4">
                        <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Eye size={16} /> See it in the App
                        </h4>
                        <p className="text-sm text-slate-300">
                            <strong>Daily Tips:</strong> Focus on mental wellbeing and &quot;trans joy&quot; alongside technical practice.
                            <br />
                            <strong>Content Warnings:</strong> Allow you to opt-out of sensitive topics to protect mental health.
                        </p>
                    </div>
                    <Citation
                        authors="Hancock, A., & Garabedian, L."
                        year="2013"
                        title="Transgender voice and communication treatment: A retrospective study"
                        journal="International Journal of Language & Communication Disorders, 48(1), 24-34"
                    />
                </ResearchSection>

                <ResearchSection
                    title="Feature Research Mapping"
                    icon={<Target className="text-emerald-400" size={20} />}
                >
                    <p className="mb-4">
                        <strong>How each app feature maps to research:</strong>
                    </p>
                    <div className="space-y-3">
                        <FeatureRow feature="Pitch Visualizer" research="F0 tracking and target ranges" />
                        <FeatureRow feature="Resonance Lab" research="Formant analysis (F1, F2, F3) via LPC" />
                        <FeatureRow feature="Voice Fingerprint" research="Spectral Tilt/Weight & Acoustic signature" />
                        <FeatureRow feature="Voice Quality Gauge" research="Harmonics-to-Noise Ratio (HNR) & CPP" />
                        <FeatureRow feature="SOVTE Exercises" research="Aerodynamic efficiency & vocal safety" />
                        <FeatureRow feature="Smart Practice" research="Motor learning theory (repetition/feedback)" />
                    </div>
                </ResearchSection>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <h3 className="font-bold text-amber-400 mb-2">Scientific Integrity Note</h3>
                <p className="text-slate-300 text-sm">
                    While we use clinical-grade algorithms (LPC, Autocorrelation, Cepstral Analysis), mobile device microphones vary in quality.
                    Absolute values (e.g., exact Hz or dB) may have small margins of error compared to laboratory equipment.
                    Always focus on <em>trends</em> and <em>relative progress</em> over single data points.
                </p>
            </div>

            {/* Further Reading */}
            <div className="mt-8">
                <h3 className="font-bold text-white mb-4">Further Reading</h3>
                <div className="grid md:grid-cols-2 gap-3">
                    <ExternalResource
                        title="WPATH Standards of Care 8"
                        url="https://www.wpath.org/soc8"
                    />
                    <ExternalResource
                        title="UCSF Transgender Care"
                        url="https://transcare.ucsf.edu/guidelines/voice-speech"
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ feature, research }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
        <span className="font-medium text-white">{feature}</span>
        <span className="text-sm text-slate-400">{research}</span>
    </div>
);

const ExternalResource = ({ title, url }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
    >
        <span className="text-white">{title}</span>
        <ExternalLink className="text-slate-400" size={16} />
    </a>
);

export default ResearchView;
