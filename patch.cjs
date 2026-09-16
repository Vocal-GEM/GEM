const fs = require('fs');
let content = fs.readFileSync('src/components/exercises/ShadowingExercise.jsx', 'utf8');
content = content.replace(
    '<button onClick={() => setPhase(\'select\')} className="mr-2 text-slate-400 hover:text-white">',
    '<button onClick={() => setPhase(\'select\')} className="mr-2 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:outline-none" aria-label="Back to selection">'
);
content = content.replace(
    '<button onClick={onClose} className="p-2 text-slate-400 hover:text-white">',
    '<button onClick={onClose} className="p-2 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:outline-none" aria-label="Close exercise">'
);
content = content.replace(
    'className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${isRecording ? \'bg-red-500 border-4 border-red-400\' : \'bg-blue-600 border-4 border-blue-500\'\n                                    }`}',
    'className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:outline-none ${isRecording ? \'bg-red-500 border-4 border-red-400\' : \'bg-blue-600 border-4 border-blue-500\'\n                                    }`}\n                                aria-label={isRecording ? \'Stop recording\' : \'Start recording\'}'
);
fs.writeFileSync('src/components/exercises/ShadowingExercise.jsx', content);
