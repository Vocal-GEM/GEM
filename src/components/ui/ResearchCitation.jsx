import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { RESEARCH_LIBRARY } from '../../data/research/ResearchLibrary';

const ResearchCitation = ({ citationIds }) => {
    const [expandedIds, setExpandedIds] = useState([]);

    if (!citationIds || citationIds.length === 0) return null;

    const citations = citationIds
        .map(id => RESEARCH_LIBRARY.find(paper => paper.id === id))
        .filter(paper => paper !== undefined);

    if (citations.length === 0) return null;

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    return (
        <div className="mt-12 pt-6 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" />
                Science Behind This
            </h3>

            <div className="space-y-4">
                {citations.map(paper => {
                    const isExpanded = expandedIds.includes(paper.id);

                    return (
                        <div
                            key={paper.id}
                            className={`
                                rounded-xl border transition-all duration-300 overflow-hidden
                                ${isExpanded
                                    ? 'bg-slate-800/80 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                                }
                            `}
                        >
                            <div
                                onClick={() => toggleExpand(paper.id)}
                                className="p-4 cursor-pointer flex items-start gap-4"
                            >
                                <div className={`mt-1 p-2 rounded-lg ${isExpanded ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                                    <BookOpen size={18} />
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-200 text-sm leading-snug mb-1">
                                        {paper.title}
                                    </h4>
                                    <div className="text-xs text-slate-400 flex flex-wrap gap-2 items-center">
                                        <span>{paper.authors} ({paper.year})</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span className="italic opacity-75">{paper.journal}</span>
                                    </div>
                                </div>

                                <button className="text-slate-500 hover:text-white transition-colors">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="px-4 pb-4 pl-[4.5rem]">
                                    <div className="text-sm text-slate-300 mb-4 leading-relaxed">
                                        {paper.summary}
                                    </div>

                                    {paper.keyFindings && (
                                        <div className="mb-4">
                                            <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Key Findings</h5>
                                            <ul className="space-y-1">
                                                {paper.keyFindings.map((finding, idx) => (
                                                    <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                                        <span>{finding}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {paper.clinicalRelevance && (
                                        <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
                                            <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Clinical Relevance</h5>
                                            <p className="text-xs text-indigo-100/80 leading-relaxed">
                                                {paper.clinicalRelevance}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResearchCitation;
