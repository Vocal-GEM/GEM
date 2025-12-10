import React, { useState } from 'react';
import { Wind, Activity, Speaker, Mic, BookOpen, Download, ChevronRight } from 'lucide-react';

const VocalAnatomyLesson = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('instrument'); // 'instrument' or 'larynx'

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-800 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('instrument')}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'instrument' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    The Instrument
                </button>
                <button
                    onClick={() => setActiveTab('larynx')}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'larynx' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    The Larynx
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'instrument' ? <InstrumentView /> : <LarynxView />}
            </div>

            {/* Footer / Downloads */}
            <div className="border-t border-slate-700 pt-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-pink-500" /> Lesson Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResourceCard
                        title="Trans Guide to Vocal Anatomy"
                        desc="E-book reference guide"
                        fileType="PDF"
                    />
                    <ResourceCard
                        title="Anatomy Colouring Book"
                        desc="Relaxing study tool"
                        fileType="PDF"
                    />
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-600 hover:border-pink-500 transition-all"
                >
                    Complete Lesson <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const InstrumentView = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Power, Source, Filter</h3>
            <p className="text-slate-400">Every acoustic instrument has these 3 components.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConceptCard
                title="Power"
                icon={<Wind size={32} />}
                color="blue"
                instrument="Lungs"
                analogy="Saxophone: Air from lungs"
                desc="The breath pressure that drives the system."
            />
            <ConceptCard
                title="Source"
                icon={<Activity size={32} />}
                color="amber"
                instrument="Vocal Folds"
                analogy="Saxophone: Reed"
                desc="The vibration that creates the raw sound (Buzz)."
            />
            <ConceptCard
                title="Filter"
                icon={<Speaker size={32} />}
                color="pink"
                instrument="Vocal Tract"
                analogy="Saxophone: Body"
                desc="The throat and mouth shapes that color the tone."
            />
        </div>
    </div>
);

const LarynxView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-2">Inside the Larynx</h3>
                <p className="text-slate-400 mb-4">
                    The "Voice Box" sits on top of the trachea. It's made of cartilage, not bone.
                </p>
                <div className="space-y-3">
                    <DetailRow label="Thyroid Cartilage" desc="The large V-shape housing (Adam's Apple / Thyroid Notch)." />
                    <DetailRow label="Cricoid Cartilage" desc="The ring shape at the bottom, sitting on the trachea." />
                    <DetailRow label="Arytenoids" desc="Two small triangles in back that open/close the folds." />
                    <DetailRow label="Vocal Folds" desc="The 'True Folds'. Vibrating muscle tissue." />
                    <DetailRow label="False Folds" desc="Vestibular folds above. Used for protection (and throat singing)." />
                    <DetailRow label="Epiglottis" desc="Leaf-shape flap that covers the airway when swallowing." />
                </div>
            </div>
        </div>

        {/* Schematic Diagram */}
        <div className="bg-slate-800 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
            {/* Simple CSS Art Larynx */}
            <div className="relative w-64 h-80">
                {/* Epiglottis */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-24 bg-rose-400 rounded-full opacity-80" title="Epiglottis"></div>

                {/* Thyroid Cartilage (The Shield) */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 border-4 border-indigo-400 rounded-3xl rotate-45 transform origin-center flex items-center justify-center opacity-50" title="Thyroid Cartilage">
                </div>

                {/* Vocal Folds (The V inside) */}
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[60px] border-t-white opacity-90 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" title="Vocal Folds (Glottis)"></div>

                {/* Cricoid (The Ring below) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-4 border-purple-400 rounded-full" title="Cricoid Cartilage"></div>

                {/* Labels */}
                <div className="absolute top-20 right-0 bg-indigo-900/80 text-white text-xs px-2 py-1 rounded">Thyroid</div>
                <div className="absolute top-36 left-0 bg-white/90 text-slate-900 font-bold text-xs px-2 py-1 rounded">Vocal Folds</div>
                <div className="absolute bottom-8 right-10 bg-purple-900/80 text-white text-xs px-2 py-1 rounded">Cricoid</div>
            </div>

            <div className="absolute bottom-4 text-slate-500 text-xs text-center w-full">
                Schematic View (Top Down)
            </div>
        </div>
    </div>
);

const DetailRow = ({ label, desc }) => (
    <div className="group hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-default">
        <div className="text-pink-400 font-bold group-hover:text-pink-300 transition-colors">{label}</div>
        <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{desc}</div>
    </div>
);

const ConceptCard = ({ title, icon, color, instrument, analogy, desc }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400'
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} hover:scale-[1.02] transition-transform cursor-default`}>
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <div className="font-bold text-xl text-white">{title}</div>
            </div>
            <div className="space-y-2 text-sm">
                <div>
                    <span className="text-slate-500 uppercase text-xs font-bold">Voice:</span>
                    <div className="text-white font-medium">{instrument}</div>
                </div>
                <div>
                    <span className="text-slate-500 uppercase text-xs font-bold">Saxophone:</span>
                    <div className="text-slate-300">{analogy.split(': ')[1]}</div>
                </div>
                <div className="pt-2 text-slate-400 border-t border-slate-700 mt-2">
                    {desc}
                </div>
            </div>
        </div>
    );
};

const ResourceCard = ({ title, desc, fileType }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700 group-hover:bg-slate-600 rounded-lg text-pink-500 transition-colors">
                <Download size={20} />
            </div>
            <div>
                <div className="font-bold text-white group-hover:text-pink-400 transition-colors">{title}</div>
                <div className="text-slate-400 text-sm">{desc}</div>
            </div>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">
            {fileType}
        </div>
    </div>
);

export default VocalAnatomyLesson;
