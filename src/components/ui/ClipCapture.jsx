import { useState, useEffect } from 'react';
import { Mic, Square, BarChart2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { usePracticeCards } from '../../context/PracticeCardsContext';
import ClipAnalysisModal from './ClipAnalysisModal';

const ClipCapture = ({ onCapture, showAnalysis = true }) => {
    const { startRecording, stopRecording, isRecording, isAudioActive, toggleAudio } = useAudio();
    const {
        activeCard,
        startRecordingSession,
        finalizeRecordingSession,
        isRecordingSession
    } = usePracticeCards();
    const [duration, setDuration] = useState(0);
    const [lastRecording, setLastRecording] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleToggle = async () => {
        if (isRecording) {
            const result = await stopRecording();

            // Finalize practice cards tracking if there was an active card
            if (isRecordingSession && result?.id) {
                await finalizeRecordingSession(result.id);
            }

            if (result) {
                // Store recording for analysis
                setLastRecording({
                    blob: result.blob,
                    url: result.url || URL.createObjectURL(result.blob),
                    id: result.id
                });

                // Auto-show analysis modal if enabled
                if (showAnalysis) {
                    setShowAnalysisModal(true);
                }

                if (onCapture) {
                    // Attach practice card info to result
                    onCapture({
                        ...result,
                        practiceCard: activeCard ? {
                            cardId: activeCard.id,
                            setId: activeCard.setId,
                            text: activeCard.text
                        } : null
                    });
                }
            }
        } else {
            // Start practice cards tracking if there's an active card
            if (activeCard) {
                startRecordingSession();
            }
            await startRecording();
        }
    };

    const handleCloseAnalysis = () => {
        setShowAnalysisModal(false);
    };

    if (!isAudioActive) {
        return (
            <button
                onClick={toggleAudio}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
                <Mic size={12} />
                <span>Enable Mic</span>
            </button>
        );
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleToggle}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isRecording
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                >
                    {isRecording ? (
                        <>
                            <Square size={12} fill="currentColor" />
                            <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                        </>
                    ) : (
                        <>
                            <Mic size={12} />
                            <span>Record Clip</span>
                        </>
                    )}
                </button>

                {/* Quick analyze button for last recording */}
                {lastRecording && !isRecording && (
                    <button
                        onClick={() => setShowAnalysisModal(true)}
                        className="p-1.5 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 transition-all"
                        title="Analyze last recording"
                    >
                        <BarChart2 size={12} />
                    </button>
                )}
            </div>

            {/* Analysis Modal */}
            {showAnalysisModal && lastRecording && (
                <ClipAnalysisModal
                    audioBlob={lastRecording.blob}
                    audioUrl={lastRecording.url}
                    onClose={handleCloseAnalysis}
                />
            )}
        </>
    );
};

export default ClipCapture;

