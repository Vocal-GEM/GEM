import { useState } from 'react';
import { Search, ArrowLeft, Book } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { useNavigation } from '../../context/NavigationContext';

const GlossaryView = () => {
    const { navigate } = useNavigation();
    const [search, setSearch] = useState('');

    const filteredTerms = GLOSSARY_TERMS.filter(term =>
        term.term.toLowerCase().includes(search.toLowerCase()) ||
        term.definition.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('coach')}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Glossary</h1>
                    <p className="text-slate-400">Green Light Protocol Terms & Definitions</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search for a term..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                />
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filteredTerms.length > 0 ? (
                    filteredTerms.map((item, index) => (
                        <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">{item.term}</h3>
                            <p className="text-slate-300 leading-relaxed text-lg">{item.definition}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <Book size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No terms found for &quot;{search}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlossaryView;
