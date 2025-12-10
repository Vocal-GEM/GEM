import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import BrightnessMeter from '../viz/BrightnessMeter';
import { Info, Play, Mic, Target } from 'lucide-react';

const VowelTuningView = () => {
    const { t } = useTranslation();
    const { audioEngineRef } = useAudio();
    const [selectedVowel, setSelectedVowel] = useState('i'); // 'i', 'a', 'u'
    const [isRecording, setIsRecording] = useState(false);

    // Vowel Definitions & Instructions
    const vowels = {
        'i': { label: t('vowelTuning.vowels.i.label'), description: t('vowelTuning.vowels.i.desc'), instruction: t('vowelTuning.vowels.i.inst') },
        'a': { label: t('vowelTuning.vowels.a.label'), description: t('vowelTuning.vowels.a.desc'), instruction: t('vowelTuning.vowels.a.inst') },
        'u': { label: t('vowelTuning.vowels.u.label'), description: t('vowelTuning.vowels.u.desc'), instruction: t('vowelTuning.vowels.u.inst') }
    };

    const toggleRecording = async () => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            await audioEngineRef.current.stop();
            setIsRecording(false);
        } else {
            await audioEngineRef.current.start();
            setIsRecording(true);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-400" />
                        {t('vowelTuning.title')}
                    </h1>
                    <p className="text-slate-400 text-sm">{t('vowelTuning.subtitle')}</p>
                </div>
                <button
                    onClick={toggleRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isRecording
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                        : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20'
                        }`}
                >
                    {isRecording ? <><Mic className="w-4 h-4" /> {t('vowelTuning.controls.stop')}</> : <><Play className="w-4 h-4" /> {t('vowelTuning.controls.start')}</>}
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Left Panel: Controls */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Brightness Meter - Real-time F2 feedback */}
                    {isRecording && (
                        <BrightnessMeter
                            dataRef={audioEngineRef.current?.analysisData || { current: {} }}
                            showTip={true}
                        />
                    )}

                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex-1">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" /> {t('vowelTuning.target')}
                        </h3>

                        <div className="flex flex-col gap-2">
                            {Object.entries(vowels).map(([key, info]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedVowel(key)}
                                    className={`p-4 rounded-xl border text-left transition-all ${selectedVowel === key
                                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1">{info.label}</div>
                                    <div className="text-xs opacity-80">{info.description}</div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <h4 className="text-blue-300 font-bold mb-2 text-sm">{t('vowelTuning.tip')}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {vowels[selectedVowel].instruction}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visualization */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-2 overflow-hidden relative">
                    <VowelSpacePlot
                        dataRef={audioEngineRef.current ? audioEngineRef.current.analysisData : { current: {} }}
                        targetVowel={selectedVowel}
                        isRecording={isRecording}
                    />

                    {!isRecording && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t('vowelTuning.empty.title')}</h3>
                                <p className="text-slate-400 mb-6">{t('vowelTuning.empty.desc')}</p>
                                <button
                                    onClick={toggleRecording}
                                    className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors"
                                >
                                    {t('vowelTuning.empty.action')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VowelTuningView;
