import React, { useState } from 'react';
import { Activity, Wind, Music, Sparkles, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import BreathVisualizer from './BreathVisualizer';

const SECTIONS = [
    {
        id: 'physical',
        title: 'Physical Stretches',
        icon: <Activity size={24} />,
        items: [
            'Arms (Cross-body, Triceps)',
            'Shoulder Rolls (Back, Forward, Hike & Drop)',
            'Legs (Quads, Hamstrings, Side Lunge)',
            'Extremities (Wrists, Ankles)',
            'Spinal Decompression (Rag Doll)',
            'Neck (Side stretches, Semi-circles)'
        ]
    },
    {
        id: 'massage',
        title: 'Jaw, Neck & Larynx',
        icon: <Sparkles size={24} />,
        items: [
            'Shoulder Massage (Dig in!)',
            'Mama Cat Neck Grabs',
            'Jaw Release (Hinge Joint)',
            'Sternocleidomastoid (Neck Ropes)',
            'Laryngeal Massage (Gentro side-to-side)',
            'Yawning Stretch',
            'Tongue Root Relaxer (Thumb press under chin)',
            'Raisins & Grapes (Face Scrunch/Open)'
        ]
    },
    {
        id: 'breathing',
        title: 'Breathing & Posture',
        icon: <Wind size={24} />,
        component: true
    },
    {
        id: 'voice',
        title: 'Voice Activation',
        icon: <Music size={24} />,
        items: [
            'Glisses on "Ah" (Sighing)',
            'Glisses on "No" (Fish lips)',
            'Pitch Circles (Small to big)',
            'Lip Trills (or Zzz/Vvv)',
            'Straw/Kazoo Phonation'
        ]
    }
];

const WarmUpRoutine = ({ onComplete }) => {
    const [checkedItems, setCheckedItems] = useState({});
    const [openSection, setOpenSection] = useState('physical');

    const toggleCheck = (item) => {
        setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    const progress = (Object.values(checkedItems).filter(Boolean).length / 20) * 100; // Approx denominator

    return (
        <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-white font-bold">Warm-Up Progress</div>
                <div className="w-1/3 bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>

            {SECTIONS.map((section) => (
                <div key={section.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-all">
                    <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between p-6 ${openSection === section.id ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${openSection === section.id ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {section.icon}
                            </div>
                            <h3 className={`text-xl font-bold ${openSection === section.id ? 'text-white' : 'text-slate-300'}`}>
                                {section.title}
                            </h3>
                        </div>
                        {openSection === section.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </button>

                    {openSection === section.id && (
                        <div className="p-6 border-t border-slate-700/50 space-y-6 animate-in slide-in-from-top-2">
                            {section.component ? (
                                <div className="space-y-8">
                                    <p className="text-slate-400 italic mb-4">
                                        &quot;Breathe into your butt (beach ball). Send the air low.&quot;
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BreathVisualizer type="conscious" />
                                        <BreathVisualizer type="square" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BreathVisualizer type="snake" />
                                        <BreathVisualizer type="doggy" />
                                    </div>
                                    <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!checkedItems['breathing-done']}
                                                onChange={() => toggleCheck('breathing-done')}
                                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-pink-500 focus:ring-pink-500"
                                            />
                                            <span className="text-white">I have completed my breathing exercises</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {section.items.map((item, idx) => (
                                        <label key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-colors">
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkedItems[item] ? 'bg-green-500 border-green-500' : 'border-slate-600 group-hover:border-slate-500'
                                                }`}>
                                                {checkedItems[item] && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={!!checkedItems[item]}
                                                onChange={() => toggleCheck(item)}
                                            />
                                            <span className={`${checkedItems[item] ? 'text-green-400 line-through decoration-green-500/50' : 'text-slate-200'} transition-colors`}>
                                                {item}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="pt-8 flex justify-center">
                <button
                    onClick={onComplete}
                    className="px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 transform hover:scale-105 transition-all text-lg flex items-center gap-2"
                >
                    <CheckCircle /> Complete Warm-Up
                </button>
            </div>
        </div>
    );
};

export default WarmUpRoutine;
