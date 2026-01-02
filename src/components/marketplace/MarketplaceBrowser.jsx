import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Download, Filter, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MarketplaceBrowser = () => {
    const { t } = useTranslation();
    const [packs, setPacks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for initial dev
    useEffect(() => {
        // In real implementation, fetch from /api/marketplace/packs
        setTimeout(() => {
            setPacks([
                {
                    id: '1',
                    title: 'Feminization Fundamentals',
                    creator: 'VoiceLab Pro',
                    description: 'Essential exercises for raising pitch and brightening resonance.',
                    rating: 4.8,
                    downloads: 1250,
                    price: 0,
                    category: 'feminization',
                    image: '🌸'
                },
                {
                    id: '2',
                    title: 'Masculinization Mastery',
                    creator: 'LowTones',
                    description: 'Build vocal weight and lower your resonance safely.',
                    rating: 4.7,
                    downloads: 890,
                    price: 999, // cents
                    category: 'masculinization',
                    image: '🦁'
                },
                {
                    id: '3',
                    title: 'Breath Support 101',
                    creator: 'Coach Sarah',
                    description: 'Stabilize your voice with proper breathing techniques.',
                    rating: 4.9,
                    downloads: 2100,
                    price: 0,
                    category: 'technique',
                    image: '💨'
                },
                {
                    id: '4',
                    title: 'Range Extension',
                    creator: 'HighNote',
                    description: 'Safely expand your upper and lower range.',
                    rating: 4.6,
                    downloads: 650,
                    price: 499,
                    category: 'technique',
                    image: '🎵'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredPacks = packs.filter(pack => {
        const matchesCategory = filter === 'all' || pack.category === filter;
        const matchesSearch = pack.title.toLowerCase().includes(search.toLowerCase()) ||
            pack.description.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="marketplace-container p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                    {t('marketplace.title', 'Voice Training Marketplace')}
                </h1>
                <p className="text-gray-400">
                    {t('marketplace.subtitle', 'Discover exercise packs created by the community and professionals')}
                </p>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('marketplace.search', 'Search packs...')}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'feminization', 'masculinization', 'technique'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${filter === cat
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800/50 h-64 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPacks.map(pack => (
                            <motion.div
                                key={pack.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-900/20 group"
                            >
                                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    {pack.image}
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        {pack.rating}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                                            {pack.title}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500">by {pack.creator}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {pack.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {pack.downloads.toLocaleString()}
                                        </div>

                                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                                            {pack.price === 0 ? (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Free
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-4 h-4" />
                                                    ${(pack.price / 100).toFixed(2)}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
