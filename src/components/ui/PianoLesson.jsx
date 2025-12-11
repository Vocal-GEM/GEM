import { useState, useEffect, useRef } from 'react';
import { Music, Volume2, Info, CheckCircle, HelpCircle } from 'lucide-react';

// Frequencies for Octave 3 (and C4)
const NOTES = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
    'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63
};

const PianoLesson = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('basics'); // basics, sharps, octaves, quiz
    const [lastPlayed, setLastPlayed] = useState(null);
    const audioCtx = useRef(null);

    const playNote = (note, freq) => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const osc = audioCtx.current.createOscillator();
        const gainNode = audioCtx.current.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);

        gainNode.gain.setValueAtTime(0.3, audioCtx.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 1);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.current.destination);

        osc.start();
        osc.stop(audioCtx.current.currentTime + 1);

        setLastPlayed(note);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Quickie Piano Theory</h2>
                <p className="text-slate-400">
                    A little bit of piano understanding goes a long way. We use it to map pitch in our minds.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto">
                {['basics', 'sharps', 'octaves', 'quiz'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab === 'sharps' ? 'Sharps & Flats' : tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl min-h-[400px]">
                {activeTab === 'basics' && <BasicsTab />}
                {activeTab === 'sharps' && <SharpsTab />}
                {activeTab === 'octaves' && <OctavesTab />}
                {activeTab === 'quiz' && <QuizTab onPlay={playNote} lastPlayed={lastPlayed} />}
            </div>

            {/* Interactive Piano (Always Visible) */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Interactive Keyboard (Octave 3-4)</h3>
                    {lastPlayed && (
                        <div className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm font-mono animate-in fade-in">
                            Played: {lastPlayed}
                        </div>
                    )}
                </div>
                <div className="relative h-48 flex justify-center select-none overflow-hidden rounded-xl bg-black px-1">
                    {/* White Keys */}
                    {['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'].map((note) => (
                        <div
                            key={note}
                            onMouseDown={() => playNote(note, NOTES[note])}
                            className="bg-white hover:bg-slate-100 active:bg-slate-200 border-x border-slate-300 w-12 h-full rounded-b-lg relative cursor-pointer group active:scale-[0.98] transition-transform origin-top z-0"
                        >
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 font-bold text-xs pointer-events-none">
                                {note}
                            </span>
                        </div>
                    ))}

                    {/* Black Keys - Positioned absolutely based on white keys */}
                    {/* C#3 between C3(0) and D3(1) */}
                    <BlackKey note="C#3/Db3" left="36px" onClick={() => playNote('C#3', NOTES['C#3'])} />
                    {/* D#3 between D3 and E3 */}
                    <BlackKey note="D#3/Eb3" left="84px" onClick={() => playNote('D#3', NOTES['D#3'])} />
                    {/* Skip E-F gap */}
                    {/* F#3 between F3 and G3 */}
                    <BlackKey note="F#3/Gb3" left="180px" onClick={() => playNote('F#3', NOTES['F#3'])} />
                    {/* G#3 between G3 and A3 */}
                    <BlackKey note="G#3/Ab3" left="228px" onClick={() => playNote('G#3', NOTES['G#3'])} />
                    {/* A#3 between A3 and B3 */}
                    <BlackKey note="A#3/Bb3" left="276px" onClick={() => playNote('A#3', NOTES['A#3'])} />
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">Click keys to play tones</p>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Understand the Basics
                </button>
            </div>
        </div>
    );
};

const BlackKey = ({ note, left, onClick }) => (
    <div
        style={{ left }}
        onMouseDown={onClick}
        className="absolute top-0 w-8 h-28 bg-black hover:bg-slate-800 rounded-b-lg cursor-pointer active:scale-[0.98] transition-transform origin-top z-10 shadow-lg border-x border-b border-slate-700"
        title={note}
    >
    </div>
);

const BasicsTab = () => (
    <div className="space-y-4 animate-in fade-in">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Music size={24} className="text-indigo-400" /> Naming the White Keys
        </h3>
        <ul className="space-y-3 text-slate-300">
            <li>• Keys are named <strong>A through G</strong>. There is no H!</li>
            <li>• The pattern repeats: A, B, C, D, E, F, G, A, B...</li>
            <li>• <strong>Finding C:</strong> Look for the group of <em>two black keys</em>. C is arguably the white key to the immediate left.</li>
            <li>• <strong>Finding F:</strong> Look for the group of <em>three black keys</em>. F is to the immediate left.</li>
        </ul>
        <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
            🎹 Try finding <strong>C3</strong> on the keyboard below. It&apos;s the first white key shown.
        </div>
    </div>
);

const SharpsTab = () => (
    <div className="space-y-4 animate-in fade-in">
        <h3 className="text-xl font-bold text-white">Sharps (#) and Flats (b)</h3>
        <p className="text-slate-300">
            Black keys have two names, depending on how you look at them. This is called <em>Enharmonic</em>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <div className="font-bold text-white mb-1">Sharp (#)</div>
                <div className="text-sm text-slate-400">One step <span className="text-green-400">Higher</span>.</div>
                <div className="text-xs text-slate-500 mt-2">C# is the black key above C.</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <div className="font-bold text-white mb-1">Flat (b)</div>
                <div className="text-sm text-slate-400">One step <span className="text-red-400">Lower</span>.</div>
                <div className="text-xs text-slate-500 mt-2">Db is the black key below D.</div>
            </div>
        </div>
        <p className="text-center text-white font-bold mt-2">C# and Db are the SAME NOTE.</p>
    </div>
);

const OctavesTab = () => (
    <div className="space-y-4 animate-in fade-in">
        <h3 className="text-xl font-bold text-white">Understanding Octaves</h3>
        <p className="text-slate-300">
            An octave is a set of 8 white notes (C to C). Each octave is numbered.
        </p>
        <ul className="space-y-3 text-slate-300">
            <li>• <strong>C4 (Middle C)</strong>: The center of the piano. Often the &quot;flip&quot; point for AMAB voices.</li>
            <li>• <strong>C3</strong>: One octave lower. Usually a comfortable speaking range foundation.</li>
            <li>• <strong>A4</strong>: 440 Hz.</li>
            <li>• <strong>A3</strong>: 220 Hz (Half the frequency).</li>
        </ul>
        <div className="flex gap-4 items-center justify-center p-4">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">C3</div>
                <div className="text-xs text-slate-500">Low</div>
            </div>
            <div className="h-px w-20 bg-slate-600"></div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">C4</div>
                <div className="text-xs text-slate-500">Middle C</div>
            </div>
        </div>
    </div>
);

const QuizTab = ({ onPlay, lastPlayed }) => {
    const [target, setTarget] = useState('C3');
    const [status, setStatus] = useState('waiting'); // waiting, correct, wrong

    useEffect(() => {
        if (lastPlayed) {
            if (lastPlayed === target || (target.includes('/') && target.includes(lastPlayed))) {
                setStatus('correct');
            } else {
                setStatus('wrong');
            }
        }
    }, [lastPlayed, target]);

    const nextQuestion = () => {
        const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
        const random = notes[Math.floor(Math.random() * notes.length)];
        setTarget(random);
        setStatus('waiting');
    };

    return (
        <div className="space-y-6 text-center animate-in fade-in">
            <h3 className="text-xl font-bold text-white">Pop Quiz!</h3>
            <p className="text-slate-400">Find the note on the keyboard below.</p>

            <div className="py-8">
                <div className="text-6xl font-black text-white mb-4 animate-bounce">
                    {target}
                </div>

                {status === 'waiting' && (
                    <div className="text-slate-500 flex items-center justify-center gap-2">
                        <HelpCircle size={18} /> Click the key below
                    </div>
                )}
                {status === 'correct' && (
                    <div className="text-green-400 flex items-center justify-center gap-2 font-bold animate-in zoom-in">
                        <CheckCircle size={24} /> Correct!
                    </div>
                )}
                {status === 'wrong' && (
                    <div className="text-red-400 flex items-center justify-center gap-2 font-bold animate-in shake">
                        Try Again
                    </div>
                )}
            </div>

            {status === 'correct' && (
                <button
                    onClick={nextQuestion}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500"
                >
                    Next Note
                </button>
            )}
        </div>
    );
};

export default PianoLesson;
