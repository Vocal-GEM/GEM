import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const InflectionMap = ({ onComplete }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Inflection Mapping</h2>
                <p className="text-slate-400">
                    If you don't plan your melody, you'll default to monotone.
                    We use visual markers to "Map" the text.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <h3 className="text-center text-slate-500 font-bold uppercase tracking-widest mb-6">The Map Legend</h3>

                <div className="flex justify-center gap-8 mb-12">
                    <div className="flex flex-col items-center gap-2">
                        <ArrowUpRight className="text-green-400" size={32} />
                        <span className="text-white font-bold">Pitch Up</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ArrowDownRight className="text-red-400" size={32} />
                        <span className="text-white font-bold">Pitch Down</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-yellow-400 text-3xl font-black">BOLD</span>
                        <span className="text-white font-bold">Volume/Stress</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-inner max-w-2xl mx-auto">
                    <p className="text-2xl text-slate-900 font-serif leading-loose">
                        When the <strong className="text-yellow-600">sunlight</strong> <ArrowUpRight className="inline text-green-600 w-5 h-5" /> strikes
                        raindrops in the <strong className="text-yellow-600">air</strong>, <ArrowDownRight className="inline text-red-600 w-5 h-5" />
                        they act like a <strong className="text-yellow-600">prism</strong> <ArrowUpRight className="inline text-green-600 w-5 h-5" />
                        and form a <strong className="text-yellow-600">rainbow</strong>.
                    </p>
                </div>

                <div className="text-center mt-8 text-slate-400 text-sm">
                    Read the text above, following the arrows and bold markers.
                    <br />Exaggerate it. Make it sound "Too Much".
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Can Read The Map
                </button>
            </div>
        </div>
    );
};

export default InflectionMap;
