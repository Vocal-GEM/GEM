
import { Mic } from 'lucide-react';

const TwisterCard = ({ twister, onRecord, isRecording, score, feedback }) => {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">{twister.title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{twister.difficulty} Difficulty</p>
                </div>
                {score !== null && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{score}%</div>
                        <div className="text-xs text-slate-500">Accuracy</div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
                <p className="text-xl text-center font-serif leading-relaxed text-slate-200">
                    {feedback ? (
                        feedback.map((word, i) => (
                            <span key={i} className={`${word.correct ? 'text-green-300' : 'text-red-300'} mx-1`}>
                                {word.text}
                            </span>
                        ))
                    ) : (
                        twister.text
                    )}
                </p>
            </div>

            <div className="flex justify-center gap-3">
                <button
                    onClick={onRecord}
                    disabled={isRecording}
                    className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    <Mic className="w-4 h-4" />
                    {isRecording ? 'Recording...' : 'Try It'}
                </button>
            </div>
        </div>
    );
};

export default TwisterCard;
