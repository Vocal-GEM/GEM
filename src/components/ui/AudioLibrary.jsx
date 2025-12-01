import React from 'react';
import { BookOpen, Music, Volume2 } from 'lucide-react';
import EmptyState from './EmptyState';
import { useLanguage } from '../../context/LanguageContext';

const AudioLibrary = ({ audioEngine }) => {
    const languageContext = useLanguage();
    const t = languageContext?.t || ((k) => k);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const CONCEPTS = [
        { title: t('library.brightResonance'), desc: t('library.brightResonanceDesc'), speech: t('library.brightResonanceSpeech') },
        { title: t('library.darkResonance'), desc: t('library.darkResonanceDesc'), speech: t('library.darkResonanceSpeech') },
        { title: t('library.thinWeight'), desc: t('library.thinWeightDesc'), speech: t('library.thinWeightSpeech') },
        { title: t('library.thickWeight'), desc: t('library.thickWeightDesc'), speech: t('library.thickWeightSpeech') }
    ];

    return (
        <div className="p-4 space-y-6 pb-20">
            {/* Pitch References */}
            <section aria-labelledby="pitch-refs-title">
                <h2 id="pitch-refs-title" className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Music className="text-blue-400" aria-hidden="true" /> {t('library.pitchReferences')}
                </h2>
                <EmptyState
                    icon={Music}
                    title={t('library.noRecordings')}
                    description={t('library.noRecordingsDesc')}
                    className="bg-slate-900/50 rounded-2xl border border-slate-800"
                />
            </section>

            {/* Vocal Concepts */}
            <section aria-labelledby="vocal-concepts-title">
                <h2 id="vocal-concepts-title" className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="text-purple-400" aria-hidden="true" /> {t('library.vocalConcepts')}
                </h2>
                <div className="space-y-3">
                    {CONCEPTS.map((c, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-200">{c.title}</h3>
                                <button
                                    onClick={() => speak(c.speech)}
                                    className="p-2 bg-slate-700/50 hover:bg-blue-600 rounded-full transition-colors text-slate-300 hover:text-white"
                                    aria-label={`Play ${c.title} example`}
                                >
                                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AudioLibrary;
