import re

filepath = 'src/components/views/TrainingView.jsx'

with open(filepath, 'r') as f:
    content = f.read()

# Button 1: <ArrowLeft />
content = re.sub(
    r'<button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">\s*<ArrowLeft size={20} />\s*</button>',
    '<button aria-label="Go back" title="Go back" onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">\n                    <ArrowLeft size={20} />\n                </button>',
    content
)

# Button 2: Hear Example
content = re.sub(
    r'<button\s*onClick={\(\) => handleSpeak\(ex.content\)}\s*className={`p-2 rounded-lg transition-colors \${speaking \? \'bg-red-500/20 text-red-400\' : \'bg-slate-800 text-slate-400 hover:text-white\'}`}\s*title={speaking \? \'Stop\' : \'Hear Example\'}\s*>\s*{speaking \? <VolumeX size={16} /> : <Volume2 size={16} />}\s*</button>',
    '<button\n                                        aria-label={speaking ? \'Stop example\' : \'Hear example\'}\n                                        onClick={() => handleSpeak(ex.content)}\n                                        className={`p-2 rounded-lg transition-colors focus-visible:ring-2 ${speaking ? \'bg-red-500/20 text-red-400\' : \'bg-slate-800 text-slate-400 hover:text-white\'}`}\n                                        title={speaking ? \'Stop\' : \'Hear Example\'}\n                                    >\n                                        {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}\n                                    </button>',
    content
)

with open(filepath, 'w') as f:
    f.write(content)
