import React, { useState } from 'react';
import { Search, ShoppingBag, Star, Clock, ChevronRight } from 'lucide-react';

const MarketplaceBrowser = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'warmup', label: 'Warm-ups' },
        { id: 'technique', label: 'Technique' },
        { id: 'repertoire', label: 'Songs' },
        { id: 'health', label: 'Vocal Health' }
    ];

    const packs = [
        {
            id: 1,
            title: "Morning Vocal Wakeup",
            author: "Dr. Sarah Jenkins",
            rating: 4.9,
            reviews: 124,
            price: "Free",
            category: "warmup",
            duration: "10 min",
            image: "from-orange-400 to-pink-500"
        },
        {
            id: 2,
            title: "High Note Mastery",
            author: "Vocal Pro Academy",
            rating: 4.8,
            reviews: 89,
            price: "$4.99",
            category: "technique",
            duration: "4 weeks",
            image: "from-blue-400 to-indigo-500"
        },
        {
            id: 3,
            title: "Breath Support 101",
            author: "Opera Coach Marco",
            rating: 4.7,
            reviews: 56,
            price: "$2.99",
            category: "technique",
            duration: "15 min",
            image: "from-teal-400 to-emerald-500"
        },
        {
            id: 4,
            title: "Riffs & Runs Toolkit",
            author: "Pop Star Vocal Coach",
            rating: 5.0,
            reviews: 210,
            price: "$9.99",
            category: "technique",
            duration: "Advanced",
            image: "from-purple-400 to-fuchsia-500"
        }
    ];

    const filteredPacks = packs.filter(pack =>
        (activeCategory === 'all' || pack.category === activeCategory) &&
        pack.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Exercise Marketplace
                        </h1>
                        <p className="text-slate-400">Discover lessons from top vocal coaches</p>
                    </div>
                    <button className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors relative">
                        <ShoppingBag size={20} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for exercises, coaches, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPacks.map(pack => (
                        <div key={pack.id} className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all cursor-pointer">
                            {/* Card Image */}
                            <div className={`h-32 bg-gradient-to-br ${pack.image} relative p-4 flex items-start justify-between`}>
                                <div className="px-2 py-1 bg-black/30 backdrop-blur-md rounded text-xs font-bold text-white">
                                    {pack.category}
                                </div>
                                <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={16} className="text-white" />
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{pack.title}</h3>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">{pack.author}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                        <span className="text-slate-300">{pack.rating}</span>
                                        <span>({pack.reviews})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{pack.duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
                                    <span className={`font-bold ${pack.price === 'Free' ? 'text-green-400' : 'text-white'}`}>
                                        {pack.price}
                                    </span>
                                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceBrowser;
