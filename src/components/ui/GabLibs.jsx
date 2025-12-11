import { useState, useRef } from 'react';
import { Mic, Play, BookOpen, Volume2, ChevronLeft } from 'lucide-react';
import { GAB_LIBS_STORIES } from '../../data/trainingData';

const GabLibs = () => {
    const [activeStory, setActiveStory] = useState(null);
    const [recordings, setRecordings] = useState({}); // { [keyword]: blobUrl }
    const [isRecording, setIsRecording] = useState(null); // keyword being recorded
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Temporary audio playback
    const audioRef = useRef(new Audio());

    const startRecording = async (keyword) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordings(prev => ({ ...prev, [keyword]: url }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(keyword);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(null);
        }
    };

    const playRecording = (keyword) => {
        if (recordings[keyword]) {
            audioRef.current.src = recordings[keyword];
            audioRef.current.play();
        }
    };

    // Parse text to find *bold* keywords and replace with interactive elements
    const renderStoryText = (story) => {
        const parts = story.text.split(/(\*[^*]+\*)/g);
        return (
            <div className="leading-loose text-lg text-slate-300">
                {parts.map((part, i) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                        const keyword = part.slice(1, -1);
                        const hasRecording = !!recordings[keyword];
                        return (
                            <span key={i} className="inline-block mx-1">
                                <button
                                    onClick={() => hasRecording ? playRecording(keyword) : null}
                                    className={`px-3 py-1 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${hasRecording
                                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 hover:bg-teal-500/30'
                                        : 'bg-slate-800 text-slate-500 border-dashed border-slate-600'
                                        }`}
                                >
                                    {hasRecording ? <Volume2 size={14} /> : <div className="w-3 h-3 rounded-full bg-slate-600" />}
                                    {keyword}
                                </button>
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    if (activeStory) {
        return (
            <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ChevronLeft size={20} /> Back to Library
                    </button>
                    <h2 className="text-xl font-bold text-white">{activeStory.title}</h2>
                    <div className="w-8" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Sound Board (Left) */}
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col gap-3 overflow-y-auto">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Sound Board</h3>
                        {activeStory.keywords.map(keyword => (
                            <div key={keyword} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                <span className="text-sm font-medium text-slate-300 truncate max-w-[120px]" title={keyword}>{keyword}</span>
                                <div className="flex items-center gap-2">
                                    {recordings[keyword] && (
                                        <button
                                            onClick={() => playRecording(keyword)}
                                            className="p-2 rounded-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                                        >
                                            <Play size={16} />
                                        </button>
                                    )}
                                    <button
                                        onMouseDown={() => startRecording(keyword)}
                                        onMouseUp={stopRecording}
                                        onMouseLeave={stopRecording}
                                        className={`p-2 rounded-full transition-colors ${isRecording === keyword
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        title="Hold to Record"
                                    >
                                        <Mic size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Story Reader (Right) */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800 overflow-y-auto">
                        {renderStoryText(activeStory)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Gab Libs</h2>
                    <p className="text-slate-400">Record sound effects, then read the story!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GAB_LIBS_STORIES.map(story => (
                    <button
                        key={story.id}
                        onClick={() => setActiveStory(story)}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-purple-500/50 hover:bg-slate-800/80 transition-all group"
                    >
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">{story.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{story.text.replace(/\*/g, '')}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GabLibs;
