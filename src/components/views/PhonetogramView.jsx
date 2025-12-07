import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Save, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Toast from '../ui/Toast';
import { useAudio } from '../../context/AudioContext';
import { phonetogramService } from '../../services/PhonetogramService';
import PhonetogramChart from '../viz/PhonetogramChart';

const PhonetogramView = () => {
    const { t } = useTranslation();
    const { isAudioActive, toggleAudio, dataRef } = useAudio();
    const [isRecording, setIsRecording] = useState(false);
    const [profileData, setProfileData] = useState([]);
    const [toast, setToast] = useState(null);
    const requestRef = useRef();

    // Update loop
    const update = () => {
        if (isRecording && dataRef.current) {
            const { pitch, volume } = dataRef.current;

            // Only add data if we have a valid pitch and significant volume
            // Volume is 0-1, we need to convert to approx dB SPL
            // This is a rough approximation: dB = 20 * log10(amplitude) + calibration
            // Assuming 0.001 is reference, max is 100dB? 
            // Let's use a simple mapping for now: 40dB (silence) to 100dB (loud)
            // volume 0.01 -> 40dB, volume 1.0 -> 100dB

            if (pitch > 50 && volume > 0.01) {
                // Simple linear mapping for MVP, can be calibrated later
                const db = 40 + (volume * 60);
                phonetogramService.addDataPoint(pitch, db);

                // Throttle state updates to 10fps to avoid React lag
                if (Math.random() < 0.1) {
                    setProfileData(phonetogramService.getProfileData());
                }
            }
        }
        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isRecording]);

    const handleToggleRecording = async () => {
        if (!isRecording) {
            if (!isAudioActive) await toggleAudio();
            setIsRecording(true);
        } else {
            setIsRecording(false);
            // Final update
            setProfileData(phonetogramService.getProfileData());
        }
    };

    const handleClear = () => {
        if (confirm(t('phonetogram.controls.clear') + '?')) {
            phonetogramService.clear();
            setProfileData([]);
        }
    };

    const handleSave = async () => {
        if (profileData.length === 0) {
            setToast({ message: t('phonetogram.toast.noData'), type: 'info' });
            return;
        }

        try {
            const { indexedDB, STORES } = await import('../../services/IndexedDBManager');
            await indexedDB.add(STORES.ASSESSMENTS, {
                type: 'phonetogram',
                data: profileData,
                timestamp: Date.now(),
                source: 'phonetogram'
            });
            setToast({ message: t('phonetogram.toast.saveSuccess'), type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ message: t('phonetogram.toast.saveFail'), type: 'error' });
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 p-6 lg:p-12 flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('phonetogram.title')}</h1>
                    <p className="text-slate-400">{t('phonetogram.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleClear}
                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        title={t('phonetogram.controls.clear')}
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-green-400 hover:bg-slate-700 transition-colors"
                        title={t('phonetogram.controls.save')}
                    >
                        <Save size={20} />
                    </button>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 min-h-[400px] mb-8 relative">
                <PhonetogramChart data={profileData} />

                {/* Recording Overlay */}
                {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full animate-pulse border border-red-500/50">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-bold uppercase">{t('phonetogram.recording')}</span>
                    </div>
                )}
            </div>

            {/* Controls & Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <button
                        onClick={handleToggleRecording}
                        className={`w-full py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {isRecording ? (
                            <>
                                <Square fill="currentColor" /> {t('phonetogram.controls.stop')}
                            </>
                        ) : (
                            <>
                                <Mic fill="currentColor" /> {t('phonetogram.controls.start')}
                            </>
                        )}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                        <Info size={20} className="text-blue-400" />
                        {t('phonetogram.help.title')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                            <p>{t('phonetogram.help.step1')}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                            <p>{t('phonetogram.help.step2')}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                            <p>{t('phonetogram.help.step3')}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">4</div>
                            <p>{t('phonetogram.help.step4')}</p>
                        </div>
                    </div>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default PhonetogramView;
